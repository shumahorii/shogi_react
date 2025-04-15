import React, { useState, useEffect } from 'react';
import './App.css';
import { createInitialBoard, Square as SquareType } from './models/BoardState';
import { Piece, promote, shouldPromote, getMovablePositions } from './models/Piece';
import { getSmartComputerMove } from './ai/ComputerPlayer';
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

  /**
   * マスをクリックしたときの処理（駒の移動、持ち駒の打ちなど）
   */
  const handleClick = (row: number, col: number) => {
    if (turn !== 'black' || promotionChoice) return;

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

    // 相手の駒を取ったとき、持ち駒に加える
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

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;

    setBoard(newBoard);
    setSelectedPosition(null);
    setPromotionChoice(null);
    setSelectedHandPiece(null);
    setTurn(piece.owner === 'black' ? 'white' : 'black');
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

  // AIの手番になったとき、自動で指す処理
  useEffect(() => {
    if (turn === 'white') {
      setTimeout(() => {
        const move = getSmartComputerMove(board);
        if (move) applyMove(move.from, move.to, move.piece);
      }, 500);
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
          onSelect={() => {}}
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
    </div>
  );
};

export default App;