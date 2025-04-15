import React from 'react';
import '../App.css'; // 必要に応じて CSS 分離可

interface Props {
    capturedPieces: Map<string, number>;
    selectedHandPiece: string | null;
    onSelect: (type: string) => void;
}

const HandArea: React.FC<Props> = ({ capturedPieces, selectedHandPiece, onSelect }) => {
    return (
        <div className="captured-area">
            {[...capturedPieces.entries()].map(([type, count]) => (
                <button
                    key={type}
                    className={`hand-piece ${selectedHandPiece === type ? 'selected' : ''}`}
                    onClick={() => onSelect(type)}
                >
                    {type} ×{count}
                </button>
            ))}
        </div>
    );
};

export default HandArea;
