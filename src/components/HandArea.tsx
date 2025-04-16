import React from 'react';
import '../App.css';

// Props（このコンポーネントが受け取る値）の型定義
interface Props {
    capturedPieces: Map<string, number>;          // 表示する持ち駒（駒の種類と個数のMap）
    selectedHandPiece: string | null;             // 現在選択中の手駒（プレイヤーがクリックした駒）
    onSelect: (type: string) => void;             // 駒がクリックされたときの処理
    position: 'left' | 'right';                   // 表示位置：左側（相手用）か右側（自分用）
}

/**
 * HandArea コンポーネント
 * 持ち駒（手駒）を画面に表示するためのUI。
 * プレイヤーが持ち駒をクリックして選択するためのボタン群を描画する。
 * 相手側（左側）にはクリック不可の状態で表示される。
 */
const HandArea: React.FC<Props> = ({
    capturedPieces,         // 現在の持ち駒（Map形式）
    selectedHandPiece,      // プレイヤーが選択している持ち駒
    onSelect,               // クリック時のコールバック関数
    position,               // 表示位置（'left' or 'right'）
}) => {
    return (
        // 持ち駒表示エリア（CSSのクラスで左右レイアウトを切り替える）
        <div className={`hand-area ${position}`}>
            {/* Map（持ち駒）を配列化してループ処理でボタンを生成 */}
            {[...capturedPieces.entries()].map(([type, count]) => (
                <button
                    key={type} // 各駒に一意のキーを設定（再レンダリング用）
                    className={`hand-piece ${selectedHandPiece === type ? 'selected' : ''}`}
                    // クリックされたら選択コールバック関数を呼び出す
                    onClick={() => onSelect(type)}
                    // 相手側（左）の手駒は操作不可にする（見せるだけ）
                    disabled={position === 'left'}
                >
                    {/* 駒の表示：「種類 × 個数」 */}
                    {type} ×{count}
                </button>
            ))}
        </div>
    );
};

export default HandArea;