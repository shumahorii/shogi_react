import { Square } from '../models/BoardState';

/**
 * 指定されたプレイヤーの玉（王）が盤上に存在するかを判定する関数
 *
 * @param board 現在の盤面（9×9 の二次元配列）
 * @param player チェック対象のプレイヤー（'black' または 'white'）
 * @returns 玉が存在すれば true、取られていれば false
 */
export const hasKing = (board: Square[][], player: 'black' | 'white'): boolean => {
    return board.some(row =>
        row.some(square =>
            square?.owner === player && square.type === '玉'
        )
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
    // 玉の位置を特定する
    const kingPos = board
        .flatMap((row, r) =>
            row.map((square, c) =>
                square?.owner === player && square.type === '玉' ? [r, c] : null
            )
        )
        .find(pos => pos !== null);

    // 玉が見つからなければ王手とは言えない
    if (!kingPos) return false;

    const [kr, kc] = kingPos;

    // 相手の全駒から王の位置を攻撃できるかを調べる
    return board.some((row, r) =>
        row.some((square, c) =>
            square &&
            square.owner !== player &&
            square.getMovablePositions(r, c, board).some(
                ([tr, tc]) => tr === kr && tc === kc
            )
        )
    );
};