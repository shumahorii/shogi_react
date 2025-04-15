import React, { useState } from 'react';
import './App.css';
import { createInitialBoard, Square as SquareType } from './models/BoardState';
import { Piece, promote, shouldPromote, getMovablePositions } from './models/Piece';
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

  const handleClick = (row: number, col: number) => {
    const clicked = board[row][col];

    if (promotionChoice) return; // 成り選択中は操作を無効化

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
    }
  };

  const applyMove = (from: [number, number], to: [number, number], piece: Piece) => {
    const newBoard = board.map(r => [...r]);
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = null;
    setBoard(newBoard);
    setSelectedPosition(null);
    setPromotionChoice(null);
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
