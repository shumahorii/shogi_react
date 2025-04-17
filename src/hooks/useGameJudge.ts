import { useCallback } from 'react';
import { Square } from '../models/BoardState';
import { hasKing, isInCheck } from '../logic/gameJudge';

/**
 * 勝敗・王手を判定するための専用フック
 * ゲームの終了チェックや王手状態の確認を一手ごとに行う
 */
export const useGameJudge = ({
    setIsGameOver,
}: {
    setIsGameOver: (value: boolean) => void;
}) => {
    /**
     * ゲームが終了しているか（玉が取られたか）をチェックする
     * 勝敗が決まっていればアラートを出し、ゲームを終了する
     */
    const checkAndSetGameOver = useCallback(
        (board: Square[][]) => {
            const blackAlive = hasKing(board, 'black');
            const whiteAlive = hasKing(board, 'white');

            if (!blackAlive) {
                alert('あなたの負けです（玉が取られました）');
                setIsGameOver(true);
                return true;
            }
            if (!whiteAlive) {
                alert('あなたの勝ちです（相手の玉を取りました）');
                setIsGameOver(true);
                return true;
            }
            return false;
        },
        [setIsGameOver]
    );

    /**
     * 指定プレイヤーが王手されているかを確認し、王手なら通知する
     */
    const checkOute = useCallback(
        (board: Square[][], player: 'black' | 'white') => {
            if (isInCheck(board, player)) {
                const message = player == 'black' ? '相手から王手されました！' : 'あなたの王手です！'
                alert(message);
            }
        },
        []
    );

    return { checkAndSetGameOver, checkOute };
};