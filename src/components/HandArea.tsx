import React from 'react';
import '../App.css'; // 必要に応じて作成

interface Props {
    capturedPieces: Map<string, number>;
    selectedHandPiece: string | null;
    onSelect: (type: string) => void;
    position: 'left' | 'right'; // 配置位置の指定
}

const HandArea: React.FC<Props> = ({
    capturedPieces,
    selectedHandPiece,
    onSelect,
    position,
}) => {
    return (
        <div className={`hand-area ${position}`}>
            {[...capturedPieces.entries()].map(([type, count]) => (
                <button
                    key={type}
                    className={`hand-piece ${selectedHandPiece === type ? 'selected' : ''}`}
                    onClick={() => onSelect(type)}
                    disabled={position === 'left'} // 左（相手）の駒はクリック不可
                >
                    {type} ×{count}
                </button>
            ))}
        </div>
    );
};

export default HandArea;