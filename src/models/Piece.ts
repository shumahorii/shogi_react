import { Square } from './BoardState';

export type Player = 'black' | 'white';

export interface Piece {
    type: string;
    owner: Player;
}

export const promote = (piece: Piece): Piece => {
    const map: Record<string, string> = {
        '歩': 'と',
        '銀': '成銀',
        '桂': '成桂',
        '角': '馬',
        '飛': '龍',
    };
    return { type: map[piece.type] || piece.type, owner: piece.owner };
};

export const shouldPromote = (piece: Piece, fromRow: number, toRow: number): boolean => {
    const zone = piece.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
    return (
        ['歩', '銀', '桂', '角', '飛'].includes(piece.type) &&
        (zone.includes(fromRow) || zone.includes(toRow))
    );
};

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
