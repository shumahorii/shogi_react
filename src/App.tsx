import React, { useState, useEffect } from 'react';
import './App.css';
import { createInitialBoard, Square as SquareType } from './models/BoardState';
import { Piece, promote, shouldPromote, getMovablePositions } from './models/Piece';
import { getRandomComputerMove, getSmartComputerMove } from './ai/ComputerPlayer';
import Board from './components/Board';
import PromotionModal from './components/PromotionModal';
import HandArea from './components/HandArea';

const App: React.FC = () => {
  // 盤面の状態（9x9の二次元配列）を管理
  const [board, setBoard] = useState<SquareType[][]>(createInitialBoard());
  // 現在の手番を管理（'black'＝プレイヤー、'white'＝コンピュータ）
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  // 選択中のマス（自分の駒）を保持（未選択ならnull）
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  // 成りを確認するための状態（確認中ならオブジェクトが入る）
  const [promotionChoice, setPromotionChoice] = useState<{
    from: [number, number];
    to: [number, number];
    piece: Piece;
  } | null>(null);
  // 自分が持っている持ち駒（Mapで種類ごとに数を保持）
  const [capturedPieces, setCapturedPieces] = useState<Map<string, number>>(new Map());
  // 現在選択中の持ち駒の種類（盤面に打とうとしている駒）
  const [selectedHandPiece, setSelectedHandPiece] = useState<string | null>(null);

  /**
   * ユーザーが盤面のマスをクリックしたときの処理
   * - 成り確認中やAIの手番なら無効
   * - 持ち駒を打つ／駒を動かす／駒を選択する、などを分岐処理
   */
  const handleClick = (row: number, col: number) => {
    if (turn !== 'black' || promotionChoice) return; // AIの番 or 成り中は無効
    const clicked = board[row][col]; // クリックしたマスの中身（駒 or null）

    // 持ち駒を打とうとしているときの処理
    if (selectedHandPiece && !clicked) {
      // 二歩禁止チェック：同じ列にすでに自分の歩があれば打てない
      if (
        selectedHandPiece === '歩' &&
        board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'black')
      ) {
        alert('二歩禁止です');
        return;
      }

      // 盤面をコピーし、指定の位置に持ち駒を配置
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = { type: selectedHandPiece, owner: 'black' };

      // 持ち駒の数を減らす
      const updated = new Map(capturedPieces);
      updated.set(selectedHandPiece, (updated.get(selectedHandPiece) || 0) - 1);
      if (updated.get(selectedHandPiece) === 0) updated.delete(selectedHandPiece);

      // 状態更新
      setBoard(newBoard);
      setCapturedPieces(updated);
      setSelectedHandPiece(null);
      setTurn('white'); // AIのターンへ
      return;
    }

    // すでに盤上の駒を選択している状態で、合法な移動先をクリックした場合
    if (selectedPosition) {
      const [fromRow, fromCol] = selectedPosition;
      const piece = board[fromRow][fromCol];
      const legal = getMovablePositions(piece!, fromRow, fromCol, board);
      const isLegal = legal.some(([r, c]) => r === row && c === col);

      if (isLegal) {
        // 成り判定：成りゾーンに入っていれば確認ダイアログを出す
        if (shouldPromote(piece!, fromRow, row)) {
          setPromotionChoice({ from: [fromRow, fromCol], to: [row, col], piece: piece! });
          return;
        }
        applyMove([fromRow, fromCol], [row, col], piece!); // 成り不要ならそのまま移動
      } else {
        setSelectedPosition(null); // 無効な移動先を選んだ場合は選択解除
      }
    }
    // 駒の選択（自分の駒をクリックしたとき）
    else if (clicked?.owner === 'black') {
      setSelectedPosition([row, col]);
      setSelectedHandPiece(null); // 持ち駒の選択は解除
    }
  };

  /**
   * 駒を盤面上で移動させる関数（駒の移動・取り・状態の更新をまとめて行う）
   */
  const applyMove = (from: [number, number], to: [number, number], piece: Piece) => {
    const newBoard = board.map(r => [...r]); // 盤面のコピー
    const captured = board[to[0]][to[1]]; // 移動先の駒（あれば）

    // 敵の駒を取った場合、自分の持ち駒に加える
    if (captured && captured.owner !== piece.owner && piece.owner === 'black') {
      const reverseMap: Record<string, string> = {
        'と': '歩', '成銀': '銀', '成桂': '桂', '馬': '角', '龍': '飛',
      };
      const type = reverseMap[captured.type] || captured.type;
      const updated = new Map(capturedPieces);
      updated.set(type, (updated.get(type) || 0) + 1);
      setCapturedPieces(updated);
    }

    // 駒を移動（新しい位置に置き、元の位置は空に）
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;

    // 状態の更新
    setBoard(newBoard);
    setSelectedPosition(null);
    setPromotionChoice(null);
    setSelectedHandPiece(null);
    setTurn(piece.owner === 'black' ? 'white' : 'black'); // ターン交代
  };

  /**
   * 現在選択中の駒が移動可能なマスのリストを取得
   */
  const movablePositions =
    selectedPosition && board[selectedPosition[0]][selectedPosition[1]]
      ? getMovablePositions(
          board[selectedPosition[0]][selectedPosition[1]]!,
          selectedPosition[0],
          selectedPosition[1],
          board
        )
      : [];

  /**
   * コンピュータのターンになったとき、自動で1手指す処理（useEffectで監視）
   */
  useEffect(() => {
    if (turn === 'white') {
      setTimeout(() => {
        const move = getSmartComputerMove(board);
        if (move) applyMove(move.from, move.to, move.piece); // 駒を動かす
      }, 500); // 0.5秒ディレイで自然な感じに
    }
  }, [turn]);

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>

      {/* 持ち駒一覧の表示と選択 */}
      <HandArea
        capturedPieces={capturedPieces}
        selectedHandPiece={selectedHandPiece}
        onSelect={type => {
          setSelectedHandPiece(type);
          setSelectedPosition(null);
        }}
      />

      {/* 盤面の表示（クリック操作あり） */}
      <Board
        board={board}
        selectedPosition={selectedPosition}
        movablePositions={movablePositions}
        onSquareClick={handleClick}
      />

      {/* 成り判定が必要なときに表示されるモーダル */}
      {promotionChoice && (
        <PromotionModal
          piece={promotionChoice.piece}
          onPromote={() =>
            applyMove(
              promotionChoice.from,
              promotionChoice.to,
              promote(promotionChoice.piece)
            )
          }
          onDecline={() =>
            applyMove(
              promotionChoice.from,
              promotionChoice.to,
              promotionChoice.piece
            )
          }
        />
      )}
    </div>
  );
};

export default App;
