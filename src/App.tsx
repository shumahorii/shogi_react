import React, { useState } from 'react';
import './App.css';
import Board from './components/Board';
import HandArea from './components/HandArea';
import PromotionModal from './components/PromotionModal';
import { createInitialBoard, Square } from './models/BoardState';
import { usePlayerInteraction } from './hooks/usePlayerInteraction';
import { usePromotion } from './hooks/usePromotion';
import { useComputerTurn } from './hooks/useComputerTurn';
import { Piece } from './models/piece/Piece';

const App: React.FC = () => {
  const [board, setBoard] = useState<Square[][]>(createInitialBoard());
  const [turn, setTurn] = useState<'black' | 'white'>('black');
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [selectedHandPiece, setSelectedHandPiece] = useState<string | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<Map<string, number>>(new Map());
  const [capturedPiecesWhite, setCapturedPiecesWhite] = useState<Map<string, number>>(new Map());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const { promotionChoice, setPromotionChoice } = usePromotion();

  const {
    handleSquareClick,
    handleHandPieceSelect,
    applyMove,
  } = usePlayerInteraction({
    board,
    setBoard,
    turn,
    setTurn,
    selectedPosition,
    setSelectedPosition,
    selectedHandPiece,
    setSelectedHandPiece,
    capturedPieces,
    setCapturedPieces,
    capturedPiecesWhite,
    setCapturedPiecesWhite,
    setIsGameOver,
    setPromotionChoice,
  });

  useComputerTurn({
    board,
    turn,
    setBoard,
    capturedPiecesWhite,
    setCapturedPiecesWhite,
    applyMove,
    isGameOver,
    setTurn,
  });

  const handlePromote = () => {
    if (promotionChoice) {
      const promoted = promotionChoice.piece.promote();
      applyMove(promotionChoice.from, promotionChoice.to, promoted);
    }
  };

  const handleDecline = () => {
    if (promotionChoice) {
      applyMove(promotionChoice.from, promotionChoice.to, promotionChoice.piece);
    }
  };

  const movablePositions =
    selectedPosition && board[selectedPosition[0]][selectedPosition[1]]
      ? board[selectedPosition[0]][selectedPosition[1]]!.getMovablePositions(
          selectedPosition[0],
          selectedPosition[1],
          board
        )
      : [];

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>

      <div className="board-wrapper">
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
          onSquareClick={handleSquareClick}
        />

        <HandArea
          capturedPieces={capturedPieces}
          selectedHandPiece={selectedHandPiece}
          onSelect={handleHandPieceSelect}
          position="right"
        />
      </div>

      {promotionChoice && (
        <PromotionModal
          piece={promotionChoice.piece}
          onPromote={handlePromote}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
};

export default App;
