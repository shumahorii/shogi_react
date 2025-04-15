import React from 'react';
import { Piece } from '../models/Piece';
import PieceView from './PieceView';

interface Props {
    piece: Piece | null;
    isSelected: boolean;
    isMovable: boolean;
    onClick: () => void;
}

const Square: React.FC<Props> = ({ piece, isSelected, isMovable, onClick }) => {
    return (
        <div
            className={`board-cell ${isSelected ? 'selected' : ''} ${isMovable ? 'movable' : ''}`}
            onClick={onClick}
        >
            {piece && <PieceView piece={piece} />}
        </div>
    );
};

export default Square;
