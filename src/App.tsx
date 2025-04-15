import React, { useState, useEffect } from 'react';
import './App.css';
import { createInitialBoard, Square, Square as SquareType } from './models/BoardState';
import { Piece, promote, shouldPromote, getMovablePositions } from './models/Piece';
import { getSmartComputerDrop, getSmartComputerMove, getRandomComputerMove } from './ai/ComputerPlayer';
import Board from './components/Board';
import PromotionModal from './components/PromotionModal';
import HandArea from './components/HandArea';

const App: React.FC = () => {
  // 盤面状態（9x9マス）
  const [board, setBoard] = useState<SquareType[][]>(createInitialBoard());
  // 現在の手番（black: プレイヤー、white: AI）
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  // 選択中の盤上の駒（またはnull）
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  // 成りを選択するための情報
  const [promotionChoice, setPromotionChoice] = useState<{
    from: [number, number];
    to: [number, number];
    piece: Piece;
  } | null>(null);
  // 自分の持ち駒（Map<駒の種類, 個数>）
  const [capturedPieces, setCapturedPieces] = useState<Map<string, number>>(new Map());
  // 相手（後手）の持ち駒
  const [capturedPiecesWhite, setCapturedPiecesWhite] = useState<Map<string, number>>(new Map());
  // 盤上に打つために選択中の持ち駒の種類
  const [selectedHandPiece, setSelectedHandPiece] = useState<string | null>(null);
  // ゲーム終了状態（trueなら何も操作できない）
  const [isGameOver, setIsGameOver] = useState(false);
  const [isInCheckNow, setIsInCheckNow] = useState(false);


  /**
 * 盤面上に指定プレイヤーの「玉」が存在するかをチェックする
 *
 * @param board 現在の盤面
 * @param player 調べたいプレイヤー（'black' | 'white'）
 * @returns 玉が存在すれば true、取られていれば false
 */
  const hasKing = (board: Square[][], player: 'black' | 'white'): boolean => {
    return board.some(row =>
      row.some(square => square?.owner === player && square.type === '玉')
    );
  };

  /**
   * 指定されたプレイヤー（'black' または 'white'）が王手されているかを判定する関数
   *
   * @param board 現在の盤面（9×9 の二次元配列）
   * @param player 調べたいプレイヤー（'black' か 'white'）
   * @returns 王手状態であれば true、そうでなければ false
   */
  const isInCheck = (board: Square[][], player: 'black' | 'white'): boolean => {
    // プレイヤーの「玉」の位置を探す。
    // flatMap + map によって [行, 列] を見つけ、見つからなければ null
    const kingPos = board.flatMap((row, r) =>
      row.map((square, c) =>
        square?.owner === player && square.type === '玉' ? [r, c] : null // 自分の玉なら位置を返す
      )
    ).find(pos => pos !== null); // 最初に見つかった玉の位置を取得

    // 玉が見つからない場合（例：すでに取られている）は王手状態ではないとする
    if (!kingPos) return false;

    // 玉の位置を取得（行と列）
    const [kr, kc] = kingPos;

    // 敵の全ての駒について、玉に対して攻撃可能かをチェックする
    return board.some((row, r) =>
      row.some((square, c) =>
        square && square.owner !== player && // 敵の駒であることを確認し
        getMovablePositions(square, r, c, board).some(
          ([tr, tc]) => tr === kr && tc === kc // その駒が玉の位置を攻撃可能かを調べる
        )
      )
    );
  };

  /**
   * マスをクリックしたときの処理（駒の移動、持ち駒の打ちなど）
   */
  const handleClick = (row: number, col: number) => {
    if (isGameOver || turn !== 'black' || promotionChoice) return;

    const clicked = board[row][col];

    // 持ち駒を打とうとしているときの処理
    if (selectedHandPiece && !clicked) {
      // 二歩禁止チェック（同列に自分の歩があると打てない）
      if (
        selectedHandPiece === '歩' &&
        board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'black')
      ) {
        alert('二歩禁止です');
        return;
      }

      // 駒を打ち込む
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = { type: selectedHandPiece, owner: 'black' };

      // 手駒から減らす
      const updated = new Map(capturedPieces);
      updated.set(selectedHandPiece, (updated.get(selectedHandPiece) || 0) - 1);
      if (updated.get(selectedHandPiece) === 0) updated.delete(selectedHandPiece);

      setBoard(newBoard);
      setCapturedPieces(updated);
      setSelectedHandPiece(null);
      setTurn('white');
      return;
    }

    // 駒を移動させる処理
    if (selectedPosition) {
      const [fromRow, fromCol] = selectedPosition;
      const piece = board[fromRow][fromCol];
      const legal = getMovablePositions(piece!, fromRow, fromCol, board);
      const isLegal = legal.some(([r, c]) => r === row && c === col);
      if (isLegal) {
        if (shouldPromote(piece!, fromRow, row)) {
          setPromotionChoice({ from: [fromRow, fromCol], to: [row, col], piece: piece! });
          return;
        }
        applyMove([fromRow, fromCol], [row, col], piece!);
      } else {
        setSelectedPosition(null);
      }
    } else if (clicked?.owner === 'black') {
      // 駒の選択
      setSelectedPosition([row, col]);
      setSelectedHandPiece(null);
    }
  };

  /**
   * 駒を移動する共通処理（盤上の移動＋取った駒の管理）
   */
  const applyMove = (from: [number, number], to: [number, number], piece: Piece) => {
    const newBoard = board.map(r => [...r]);
    const captured = board[to[0]][to[1]];

    // 駒を取ったら持ち駒に追加
    if (captured && captured.owner !== piece.owner) {
      const reverseMap: Record<string, string> = {
        'と': '歩', '成銀': '銀', '成桂': '桂', '馬': '角', '龍': '飛',
      };
      const type = reverseMap[captured.type] || captured.type;
      const updateMap = piece.owner === 'black' ? capturedPieces : capturedPiecesWhite;
      const setter = piece.owner === 'black' ? setCapturedPieces : setCapturedPiecesWhite;
      const updated = new Map(updateMap);
      updated.set(type, (updated.get(type) || 0) + 1);
      setter(updated);
    }

    // 駒の移動
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;
    setBoard(newBoard);

    // 玉が取られたか判定
    if (!hasKing(newBoard, 'black')) {
      alert('あなたの負けです（玉が取られました）');
      setIsGameOver(true);
      return;
    } else if (!hasKing(newBoard, 'white')) {
      alert('あなたの勝ちです（相手の玉を取りました）');
      setIsGameOver(true);
      return;
    }

    // 通常の状態更新
    setSelectedPosition(null);
    setPromotionChoice(null);
    setSelectedHandPiece(null);
    setTurn(piece.owner === 'black' ? 'white' : 'black');

    // 王手チェック
    setIsInCheckNow(isInCheck(newBoard, piece.owner === 'black' ? 'white' : 'black'));

  };


  // 選択中の駒が移動可能なマスの一覧
  const movablePositions =
    selectedPosition && board[selectedPosition[0]][selectedPosition[1]]
      ? getMovablePositions(
        board[selectedPosition[0]][selectedPosition[1]]!,
        selectedPosition[0],
        selectedPosition[1],
        board
      )
      : [];

  // 白（AI）の手番になったとき、自動で指す処理（盤上の移動 or 持ち駒の打ち）
  useEffect(() => {
    if (turn === 'white') {
      setTimeout(() => {
        // まず盤面上の駒を使った通常の移動を試みる
        const move = getRandomComputerMove(board);
        // const move = getSmartComputerMove(board);

        if (move) {
          applyMove(move.from, move.to, move.piece);
        } else {
          // 移動できる手がなければ、持ち駒を打てる場所を探す
          const drop = getSmartComputerDrop(board, capturedPiecesWhite);
          if (drop) {
            // 盤面に持ち駒を配置
            const newBoard = board.map(r => [...r]);
            newBoard[drop.to[0]][drop.to[1]] = { type: drop.type, owner: 'white' };
            setBoard(newBoard);

            // 使用した駒を持ち駒から1つ減らす
            const updated = new Map(capturedPiecesWhite);
            updated.set(drop.type, updated.get(drop.type)! - 1);
            if (updated.get(drop.type)! <= 0) updated.delete(drop.type);
            setCapturedPiecesWhite(updated);

            // 手番をプレイヤーに交代
            setTurn('black');
          }
        }
      }, 500); // 少し待ってから動作させて自然な思考感を出す
    }
  }, [turn]);

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>

      <div className="board-wrapper">
        {/* 相手の持ち駒：左側 */}
        <HandArea
          capturedPieces={capturedPiecesWhite}
          selectedHandPiece={null}
          onSelect={() => { }}
          position="left"
        />

        <Board
          board={board}
          selectedPosition={selectedPosition}
          movablePositions={movablePositions}
          onSquareClick={handleClick}
        />

        {/* 自分の持ち駒：右側 */}
        <HandArea
          capturedPieces={capturedPieces}
          selectedHandPiece={selectedHandPiece}
          onSelect={type => {
            setSelectedHandPiece(type);
            setSelectedPosition(null);
          }}
          position="right"
        />
      </div>

      {/* 成り選択モーダル */}
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

      {isInCheckNow && (
        <div className="check-banner">
          <span>王手！</span>
        </div>
      )}
    </div>
  );
};

export default App;