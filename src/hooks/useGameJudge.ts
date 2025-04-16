import { useCallback } from 'react';
import { Square } from '../models/BoardState';
import { getMovablePositions } from '../models/Piece';

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
                alert('王手です');
            }
        },
        []
    );

    return { checkAndSetGameOver, checkOute };
};

/**
 * 指定されたプレイヤーの玉（王）が盤上に存在するかを判定する関数
 *
 * @param board 現在の盤面（9×9 の二次元配列）
 * @param player チェック対象のプレイヤー（'black' または 'white'）
 * @returns 玉が存在すれば true、取られていれば false
 */
export const hasKing = (board: Square[][], player: 'black' | 'white'): boolean => {
    return board.some(row =>
        row.some(square => square?.owner === player && square.type === '玉')
    );
};

/**
 * 指定されたプレイヤーが王手されているかを判定する関数
 *
 * @param board 現在の盤面（9×9 の二次元配列）
 * @param player 判定対象のプレイヤー（'black' または 'white'）
 * @returns 王手状態であれば true、そうでなければ false
 */
export const isInCheck = (board: Square[][], player: 'black' | 'white'): boolean => {
    // 玉（王）の位置を探す
    const kingPos = board.flatMap((row, r) =>
        row.map((square, c) =>
            square?.owner === player && square.type === '玉' ? [r, c] : null
        )
    ).find(pos => pos !== null);

    if (!kingPos) return false;

    const [kr, kc] = kingPos;

    // 相手の全ての駒から王の位置に攻撃が可能かどうかを調べる
    return board.some((row, r) =>
        row.some((square, c) =>
            square &&
            square.owner !== player &&
            getMovablePositions(square, r, c, board).some(([tr, tc]) => tr === kr && tc === kc)
        )
    );
};