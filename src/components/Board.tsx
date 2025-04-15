import React from 'react';
import { Square as SquareType } from '../models/BoardState';
import Square from './Square';

interface Props {
    board: SquareType[][];
    selectedPosition: [number, number] | null;
    movablePositions: [number, number][];
    onSquareClick: (row: number, col: number) => void;
}

const Board: React.FC<Props> = ({ board, selectedPosition, movablePositions, onSquareClick }) => {
    return (
        <div className="board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {row.map((square, colIndex) => {
                        const isSelected = selectedPosition?.[0] === rowIndex && selectedPosition?.[1] === colIndex;
                        const isMovable = movablePositions.some(([r, c]) => r === rowIndex && c === colIndex);
                        return (
                            <Square
                                key={colIndex}
                                piece={square}
                                isSelected={isSelected}
                                isMovable={isMovable}
                                onClick={() => onSquareClick(rowIndex, colIndex)}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;
