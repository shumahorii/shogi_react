import React, { useState } from 'react';
import './App.css';
import { createInitialBoard, Square as SquareType } from './models/BoardState';
import {
  Piece,
  promote,
  shouldPromote,
  getMovablePositions
} from './models/Piece';
import Board from './components/Board';
import PromotionModal from './components/PromotionModal';

const App: React.FC = () => {
  const [board, setBoard] = useState<SquareType[][]>(createInitialBoard());
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [promotionChoice, setPromotionChoice] = useState<{
    from: [number, number];
    to: [number, number];
    piece: Piece;
  } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<Map<string, number>>(new Map());
  const [selectedHandPiece, setSelectedHandPiece] = useState<string | null>(null);

  const getOriginalType = (type: string): string => {
    const reverseMap: Record<string, string> = {
      'と': '歩',
      '成銀': '銀',
      '成桂': '桂',
      '馬': '角',
      '龍': '飛',
    };
    return reverseMap[type] || type;
  };

  const capturePiece = (captured: Piece) => {
    const type = getOriginalType(captured.type);
    const updated = new Map(capturedPieces);
    updated.set(type, (updated.get(type) || 0) + 1);
    setCapturedPieces(updated);
  };

  const applyMove = (from: [number, number], to: [number, number], piece: Piece) => {
    const newBoard = board.map(r => [...r]);

    const target = board[to[0]][to[1]];
    if (target && target.owner !== piece.owner) {
      capturePiece(target);
    }

    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;
    setBoard(newBoard);
    setSelectedPosition(null);
    setPromotionChoice(null);
    setSelectedHandPiece(null);
  };

  const handleClick = (row: number, col: number) => {
    const clicked = board[row][col];
    if (promotionChoice) return;

    // 持ち駒を打つ
    if (selectedHandPiece && !clicked) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = { type: selectedHandPiece, owner: 'black' };

      const updated = new Map(capturedPieces);
      updated.set(selectedHandPiece, (updated.get(selectedHandPiece) || 0) - 1);
      if (updated.get(selectedHandPiece) === 0) updated.delete(selectedHandPiece);

      setBoard(newBoard);
      setCapturedPieces(updated);
      setSelectedHandPiece(null);
      return;
    }

    if (selectedPosition) {
      const [fromRow, fromCol] = selectedPosition;
      const piece = board[fromRow][fromCol];
      if (piece) {
        const movable = getMovablePositions(piece, fromRow, fromCol, board);
        const isMovable = movable.some(([r, c]) => r === row && c === col);

        if (isMovable) {
          if (shouldPromote(piece, fromRow, row)) {
            setPromotionChoice({
              from: [fromRow, fromCol],
              to: [row, col],
              piece,
            });
            return;
          }
          applyMove([fromRow, fromCol], [row, col], piece);
          return;
        }
      }
      setSelectedPosition(null);
    } else if (clicked && clicked.owner === 'black') {
      setSelectedPosition([row, col]);
      setSelectedHandPiece(null);
    }
  };

  const handleHandClick = (type: string) => {
    setSelectedHandPiece(type);
    setSelectedPosition(null);
  };

  const movablePositions =
    selectedPosition && board[selectedPosition[0]][selectedPosition[1]]
      ? getMovablePositions(
          board[selectedPosition[0]][selectedPosition[1]]!,
          selectedPosition[0],
          selectedPosition[1],
          board
        )
      : [];

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>

      <div className="captured-area">
        {[...capturedPieces.entries()].map(([type, count]) => (
          <button
            key={type}
            className={`hand-piece ${selectedHandPiece === type ? 'selected' : ''}`}
            onClick={() => handleHandClick(type)}
          >
            {type} ×{count}
          </button>
        ))}
      </div>

      <Board
        board={board}
        selectedPosition={selectedPosition}
        movablePositions={movablePositions}
        onSquareClick={handleClick}
      />

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
