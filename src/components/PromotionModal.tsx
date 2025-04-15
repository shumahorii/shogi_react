import React from 'react';
import { Piece } from '../models/Piece';

interface Props {
    piece: Piece;
    onPromote: () => void;
    onDecline: () => void;
}

const PromotionModal: React.FC<Props> = ({ piece, onPromote, onDecline }) => {
    return (
        <div className="promotion-modal">
            <p>
                {piece.owner === 'black' ? 'あなたの' : '相手の'}「{piece.type}」を成りますか？
            </p>
            <div style={{ marginTop: '12px' }}>
                <button onClick={onPromote}>成る</button>
                <button onClick={onDecline} style={{ marginLeft: '8px' }}>成らない</button>
            </div>
        </div>
    );
};

export default PromotionModal;
