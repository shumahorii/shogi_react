import { Piece } from '../models/Piece';
import { Square } from '../models/BoardState';

/**
 * 指定された駒を成り状態に変換する関数
 *
 * @param piece 成りさせたい駒
 * @returns 成り後の駒（元の駒が成れない種類であればそのまま）
 */
export const promote = (piece: Piece): Piece => {
    const map: Record<string, string> = {
        '歩': 'と',
        '銀': '成銀',
        '桂': '成桂',
        '角': '馬',
        '飛': '龍',
    };
    return {
        type: map[piece.type] || piece.type,
        owner: piece.owner,
    };
};

/**
 * 成った駒を元の種類に戻す（持ち駒として使うときなど）
 *
 * @param type 成り駒の種類（例：'と', '成銀', '馬'など）
 * @returns 元の駒の種類（例：'歩', '銀', '角'など）
 */
export const demote = (type: string): string => {
    const reverseMap: Record<string, string> = {
        'と': '歩',
        '成銀': '銀',
        '成桂': '桂',
        '馬': '角',
        '龍': '飛',
    };
    return reverseMap[type] || type;
};

/**
 * 成り判定を行う関数
 *
 * @param piece 駒の情報
 * @param fromRow 移動元の行（0〜8）
 * @param toRow 移動先の行（0〜8）
 * @returns 成るべき条件を満たす場合 true
 */
export const shouldPromote = (
    piece: Piece,
    fromRow: number,
    toRow: number
): boolean => {
    const zone = piece.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
    return (
        ['歩', '銀', '桂', '角', '飛'].includes(piece.type) &&
        (zone.includes(fromRow) || zone.includes(toRow))
    );
};

/**
 * 駒の種類と盤面から合法的な移動先を返す関数
 *
 * @param piece 移動対象の駒
 * @param row 現在の行位置
 * @param col 現在の列位置
 * @param board 現在の盤面情報（9x9の二次元配列）
 * @returns 移動可能な [行, 列] の配列
 */
export const getMovablePositions = (
    piece: Piece,
    row: number,
    col: number,
    board: Square[][]
): [number, number][] => {
    const moves: [number, number][] = [];

    const isInside = (r: number, c: number) =>
        r >= 0 && r < 9 && c >= 0 && c < 9 &&
        (!board[r][c] || board[r][c]?.owner !== piece.owner);

    const dir = piece.owner === 'black' ? -1 : 1;

    const goldLike = () => {
        [[dir, 0], [dir, -1], [dir, 1], [0, -1], [0, 1], [-dir, 0]].forEach(([dr, dc]) => {
            const r = row + dr;
            const c = col + dc;
            if (isInside(r, c)) moves.push([r, c]);
        });
    };

    switch (piece.type) {
        case '歩':
            if (isInside(row + dir, col)) moves.push([row + dir, col]);
            break;

        case '金':
        case 'と':
        case '成銀':
        case '成桂':
            goldLike();
            break;

        case '玉':
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
            [[dir, 0], [dir, -1], [dir, 1], [-dir, -1], [-dir, 1]].forEach(([dr, dc]) => {
                const r = row + dr;
                const c = col + dc;
                if (isInside(r, c)) moves.push([r, c]);
            });
            break;

        case '桂':
            const r1 = row + 2 * dir;
            if (isInside(r1, col - 1)) moves.push([r1, col - 1]);
            if (isInside(r1, col + 1)) moves.push([r1, col + 1]);
            break;

        case '角':
        case '馬':
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 9; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (!isInside(r, c)) break;
                    moves.push([r, c]);
                    if (board[r][c]) break;
                }
            });
            if (piece.type === '馬') goldLike();
            break;

        case '飛':
        case '龍':
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