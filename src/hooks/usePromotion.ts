import { useState } from 'react';
import { Piece } from '../models/Piece';

/**
 * 成り処理の状態を管理するだけのシンプルなフック
 * 成る/成らないの選択肢は App.tsx 側で制御
 */
export const usePromotion = () => {
    // 成り選択モーダルで使う状態（選択された駒と位置情報）
    const [promotionChoice, setPromotionChoice] = useState<{
        from: [number, number];
        to: [number, number];
        piece: Piece;
    } | null>(null);

    return {
        promotionChoice,       // 現在の成り選択状態（null なら非表示）
        setPromotionChoice,    // 成り選択状態の更新関数
    };
};