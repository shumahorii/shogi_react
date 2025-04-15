// Square型は盤面上の1マス（駒 or null）を表す
import { Square } from './BoardState';

// 駒の持ち主（プレイヤー）は 'black'（先手）または 'white'（後手）
export type Player = 'black' | 'white';

// Piece型は1つの駒を表す（種類typeと持ち主ownerを持つ）
export interface Piece {
    type: string;   // 駒の種類（例：'歩', '銀', '飛' など）
    owner: Player;  // 駒の所有者（先手か後手か）
}

/**
 * 指定された駒を成り状態に変換する。
 * 対象の駒が成り可能な種類であれば、対応する「成り駒」に変換する。
 * 成れない種類の場合はそのまま返す。
 *
 * @param piece 成り処理を行う対象の駒
 * @returns 成り駒（もしくは元のままの駒）
 */
export const promote = (piece: Piece): Piece => {
    const map: Record<string, string> = {
        '歩': 'と',
        '銀': '成銀',
        '桂': '成桂',
        '角': '馬',
        '飛': '龍',
    };
    // 成り可能な駒なら成り駒に変換し、所有者情報はそのまま返す
    return { type: map[piece.type] || piece.type, owner: piece.owner };
};

/**
 * 駒が成るべき状況かどうかを判定する。
 * 以下の条件をすべて満たすときに true を返す：
 * - 成り対象の駒（歩・銀・桂・角・飛）であること
 * - 移動元または移動先の行が敵陣に含まれていること（3段目以内）
 *
 * @param piece 判定対象の駒
 * @param fromRow 駒の移動元の行インデックス（0〜8）
 * @param toRow 駒の移動先の行インデックス（0〜8）
 * @returns 成るべき条件を満たす場合は true、そうでない場合は false
 */
export const shouldPromote = (
    piece: Piece,
    fromRow: number,
    toRow: number
): boolean => {
    const zone = piece.owner === 'black' ? [0, 1, 2] : [6, 7, 8]; // 敵陣の行インデックス
    return (
        ['歩', '銀', '桂', '角', '飛'].includes(piece.type) &&
        (zone.includes(fromRow) || zone.includes(toRow))
    );
};

/**
 * 指定された駒が現在位置からどのマスに合法的に移動できるかを計算する。
 * 各駒の移動ルールに従い、盤外や味方の駒の上には移動できない。
 * 飛び越しは不可（角・飛なども他の駒で止まる）。
 *
 * @param piece 対象の駒
 * @param row 駒の現在の行インデックス（0〜8）
 * @param col 駒の現在の列インデックス（0〜8）
 * @param board 現在の盤面（9x9の二次元配列）
 * @returns 駒が移動できる座標の配列（[行, 列]のタプルの配列）
 */
export const getMovablePositions = (
    piece: Piece,
    row: number,
    col: number,
    board: Square[][]
): [number, number][] => {
    const moves: [number, number][] = [];

    // 指定位置が盤内であり、かつ自分の駒で塞がれていないかをチェックする関数
    const isInside = (r: number, c: number) =>
        r >= 0 && r < 9 && c >= 0 && c < 9 &&
        (!board[r][c] || board[r][c]?.owner !== piece.owner);

    // dirは前進方向（先手は上へ -1、後手は下へ +1）
    const dir = piece.owner === 'black' ? -1 : 1;

    // 金将と成り駒の移動ルール（金と同じ6方向）を追加する補助関数
    const goldLike = () => {
        [[dir, 0], [dir, -1], [dir, 1], [0, -1], [0, 1], [-dir, 0]].forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            if (isInside(r, c)) moves.push([r, c]);
        });
    };

    // 駒の種類に応じて分岐して処理
    switch (piece.type) {
        case '歩':
            // 前に1マス進める
            if (isInside(row + dir, col)) moves.push([row + dir, col]);
            break;

        case '金':
        case 'と':
        case '成銀':
        case '成桂':
            goldLike(); // 金の動きと同様
            break;

        case '玉':
            // 8方向全てに1マス移動できる
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const r = row + dr;
                    const c = col + dc;
                    if (isInside(r, c)) moves.push([r, c]);
                }
            }
            break;

        case '銀':
            // 前と斜めの5方向に1マス移動
            [[dir, 0], [dir, -1], [dir, 1], [-dir, -1], [-dir, 1]].forEach(([dr, dc]) => {
                const r = row + dr;
                const c = col + dc;
                if (isInside(r, c)) moves.push([r, c]);
            });
            break;

        case '桂':
            // 桂馬のジャンプ（2マス前進＋左右）
            const r1 = row + 2 * dir;
            if (isInside(r1, col - 1)) moves.push([r1, col - 1]);
            if (isInside(r1, col + 1)) moves.push([r1, col + 1]);
            break;

        case '角':
        case '馬':
            // 角の斜め移動（最大8方向、途中に駒があれば止まる）
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 9; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isInside(r, c)) break;
                    moves.push([r, c]);
                    if (board[r][c]) break; // 駒にぶつかったらそこでストップ
                }
            });
            if (piece.type === '馬') goldLike(); // 馬は金の動きも加わる
            break;

        case '飛':
        case '龍':
            // 飛車の縦横移動（最大8マス、途中に駒があれば止まる）
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 9; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isInside(r, c)) break;
                    moves.push([r, c]);
                    if (board[r][c]) break;
                }
            });
            if (piece.type === '龍') {
                // 龍は斜めにも1マス移動できる
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                    const r = row + dr;
                    const c = col + dc;
                    if (isInside(r, c)) moves.push([r, c]);
                });
            }
            break;
    }

    return moves;
};
