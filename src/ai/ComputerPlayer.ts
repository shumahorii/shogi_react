// Square型は将棋のマス（駒またはnull）を表す
import { Square } from '../models/BoardState';
// Piece型（駒の情報）と、その駒がどこに動けるかを計算する関数をインポート
import { getMovablePositions, Piece } from '../models/Piece';

/**
 * コンピューターの手（後手）として指すべき手をランダムに1つ選んで返す関数
 * @param board 現在の盤面（二次元配列）
 * @returns 移動前の位置・移動後の位置・動かす駒 を含んだ1手の情報 or 指せる手がない場合は null
 */
export const getRandomComputerMove = (board: Square[][]): {
    from: [number, number]; // 駒を動かす元の座標（行, 列）
    to: [number, number];   // 駒を動かす先の座標（行, 列）
    piece: Piece;           // 実際に動かす駒の情報
} | null => {
    // すべての合法手（コンピューターが指せる手）を格納するリスト
    const allMoves: {
        from: [number, number];
        to: [number, number];
        piece: Piece;
    }[] = [];

    // 盤面の全マスを調べる
    board.forEach((row, r) =>
        row.forEach((square, c) => {
            // もしそのマスに「後手（white）の駒」があるなら
            if (square && square.owner === 'white') {
                // その駒が現在の位置 (r, c) から動ける合法な座標一覧を取得
                const moves = getMovablePositions(square, r, c, board);

                // すべての合法な移動先について、1手の情報としてallMovesに追加
                moves.forEach(([toR, toC]) => {
                    allMoves.push({
                        from: [r, c],      // 駒の現在位置
                        to: [toR, toC],    // 移動先
                        piece: square      // 駒の情報
                    });
                });
            }
        })
    );

    // 指せる手が1つもない場合は null（詰みや手詰まり）
    if (allMoves.length === 0) return null;

    // 全手の中からランダムに1手を選んで返す
    return allMoves[Math.floor(Math.random() * allMoves.length)];
};
