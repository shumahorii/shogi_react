import React from 'react';
import { Piece } from '../models/Piece';

// Props（親コンポーネントから受け取る情報）の型定義
interface Props {
    piece: Piece;            // 成るかどうかを選択する対象の駒
    onPromote: () => void;   // 「成る」を選んだときに呼ばれる関数
    onDecline: () => void;   // 「成らない」を選んだときに呼ばれる関数
}

/**
 * PromotionModal コンポーネント
 * 成るかどうかを選択するモーダルウィンドウ。
 * 成りが可能な場面で表示され、ユーザーに「成る／成らない」の選択肢を提示する。
 */
const PromotionModal: React.FC<Props> = ({ piece, onPromote, onDecline }) => {
    return (
        // モーダルの外枠（CSSクラスでスタイル適用）
        <div className="promotion-modal">
            {/* 駒の所有者に応じたメッセージ表示（あなたの / 相手の） */}
            <p>
                {piece.owner === 'black' ? 'あなたの' : '相手の'}「{piece.type}」を成りますか？
            </p>

            {/* ボタン類を並べるボックス */}
            <div style={{ marginTop: '12px' }}>
                {/* 成るボタン：onPromote を呼び出す */}
                <button onClick={onPromote}>成る</button>

                {/* 成らないボタン：onDecline を呼び出す、左に余白をつける */}
                <button onClick={onDecline} style={{ marginLeft: '8px' }}>
                    成らない
                </button>
            </div>
        </div>
    );
};

// PromotionModal コンポーネントを外部でも使えるようにエクスポート
export default PromotionModal;