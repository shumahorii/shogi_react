import React, { useState } from 'react';
import './App.css';
import Board from './components/Board';
import HandArea from './components/HandArea';
import PromotionModal from './components/PromotionModal';
import { createInitialBoard, Square } from './models/BoardState';
import { getMovablePositions, promote } from './models/Piece';
import { usePlayerInteraction } from './hooks/usePlayerInteraction';
import { usePromotion } from './hooks/usePromotion';
import { useComputerTurn } from './hooks/useComputerTurn';

/**
 * アプリのメインコンポーネント
 * UIの描画と状態の定義だけに専念し、ロジックはすべてカスタムフックに委譲
 */
const App: React.FC = () => {
  /**
   * 現在の将棋盤の状態（9x9 のマス目に駒情報または null を保持する）
   */
  const [board, setBoard] = useState<Square[][]>(createInitialBoard());

  /**
   * 現在の手番（'black'：先手プレイヤー、'white'：後手コンピュータ）
   */
  const [turn, setTurn] = useState<'black' | 'white'>('black');

  /**
   * 現在選択中の盤上の駒の位置（[行, 列] 形式）
   * まだ選択されていないときは null
   * 駒を移動する際に、最初にクリックした位置がここに保存される
   */
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  /**
   * 現在選択中の持ち駒の種類（例：'歩', '金' など）を表す文字列
   * 手駒が選択されていないときは null
   */
  const [selectedHandPiece, setSelectedHandPiece] = useState<string | null>(null);

  /**
   * プレイヤー（先手）の持ち駒（Map形式で、駒の種類ごとに所持数を管理）
   * 例：Map { '歩' => 2, '銀' => 1 }
   */
  const [capturedPieces, setCapturedPieces] = useState<Map<string, number>>(new Map());

  /**
   * コンピュータ（後手）の持ち駒（Map形式で、駒の種類ごとに所持数を管理）
   */
  const [capturedPiecesWhite, setCapturedPiecesWhite] = useState<Map<string, number>>(new Map());

  /**
   * ゲームが終了しているかどうかを表すフラグ（true なら操作不可）
   * 玉が取られたときに true となる
   */
  const [isGameOver, setIsGameOver] = useState(false);


  // 成り選択状態とその setter（実際の成り処理は App.tsx 側で実行）
  const { promotionChoice, setPromotionChoice } = usePromotion();

  // 駒の選択・移動・持ち駒の打ち処理を管理するフック
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

  // コンピュータの自動手番処理（副作用として実行）
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

  /**
   * 成る処理をユーザーが選んだときに実行する関数
   */
  const handlePromote = () => {
    if (promotionChoice) {
      const promoted = promote(promotionChoice.piece);
      applyMove(promotionChoice.from, promotionChoice.to, promoted);
    }
  };

  /**
   * 成らない処理をユーザーが選んだときに実行する関数
   */
  const handleDecline = () => {
    if (promotionChoice) {
      applyMove(promotionChoice.from, promotionChoice.to, promotionChoice.piece);
    }
  };

  /**
   * 移動可能マスを取得（選択中の駒があれば）
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

  return (
    <div className="app-container">
      <h1 className="title">将棋ゲーム</h1>

      <div className="board-wrapper">
        {/* 相手（白）の持ち駒エリア（左） */}
        <HandArea
          capturedPieces={capturedPiecesWhite}
          selectedHandPiece={null}
          onSelect={() => {}}
          position="left"
        />

        {/* 将棋盤エリア */}
        <Board
          board={board}
          selectedPosition={selectedPosition}
          movablePositions={movablePositions}
          onSquareClick={handleSquareClick}
        />

        {/* 自分（黒）の持ち駒エリア（右） */}
        <HandArea
          capturedPieces={capturedPieces}
          selectedHandPiece={selectedHandPiece}
          onSelect={handleHandPieceSelect}
          position="right"
        />
      </div>

      {/* 成りモーダルの表示 */}
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