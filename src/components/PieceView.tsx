import React from 'react';
import { Piece } from '../models/piece/Piece';

interface Props {
    piece: Piece;
}

const PieceView: React.FC<Props> = ({ piece }) => {
    return (
        <div className={`piece ${piece.owner === 'black' ? '' : 'piece-rotated'}`}>
            {piece.type}
        </div>
    );
};

export default PieceView;