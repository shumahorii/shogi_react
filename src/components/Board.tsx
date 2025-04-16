import React from 'react';
import { Square as SquareType } from '../models/BoardState';
import Square from './Square';

// Props（Board コンポーネントに渡される情報）の型定義
interface Props {
    board: SquareType[][];                             // 盤面の全マス（9x9の二次元配列）
    selectedPosition: [number, number] | null;         // 現在選択されているマスの位置（未選択なら null）
    movablePositions: [number, number][];              // 選択された駒が移動可能なマスの一覧
    onSquareClick: (row: number, col: number) => void; // 各マスがクリックされたときのイベントハンドラ
}

/**
 * Board コンポーネント
 * 将棋盤全体（9×9マス）を描画する。
 */
const Board: React.FC<Props> = ({
    board,
    selectedPosition,
    movablePositions,
    onSquareClick
}) => {
    return (
        <div className="board">
            {/* 各行を描画 */}
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {/* 各列（マス）を描画 */}
                    {row.map((square, colIndex) => {
                        // このマスが選択中かどうかを判定
                        const isSelected =
                            selectedPosition?.[0] === rowIndex &&
                            selectedPosition?.[1] === colIndex;

                        // このマスが移動可能マスかどうかを判定
                        const isMovable = movablePositions.some(
                            ([r, c]) => r === rowIndex && c === colIndex
                        );

                        return (
                            <Square
                                key={colIndex}                                // 各マスに固有キーを付与
                                piece={square}                                // 駒の情報（null または Piece）
                                isSelected={isSelected}                       // このマスが現在選択中かどうか
                                isMovable={isMovable}                         // このマスが移動先候補かどうか
                                onClick={() => onSquareClick(rowIndex, colIndex)} // クリック時の処理（親から受け取る）
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;