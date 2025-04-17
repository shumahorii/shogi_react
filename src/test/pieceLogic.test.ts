import { promote, demote, shouldPromote, getMovablePositions } from '../logic/pieceLogic';
import { Piece } from '../models/Piece';
import { Square } from '../models/BoardState';

const createEmptyBoard = (): Square[][] =>
    Array.from({ length: 9 }, () => Array(9).fill(null));

describe('promote', () => {
    test('歩を成ると「と」になる', () => {
        const piece: Piece = { type: '歩', owner: 'black' };
        expect(promote(piece)).toEqual({ type: 'と', owner: 'black' });
    });

    test('角を成ると「馬」になる', () => {
        const piece: Piece = { type: '角', owner: 'white' };
        expect(promote(piece)).toEqual({ type: '馬', owner: 'white' });
    });

    test('金は成らない', () => {
        const piece: Piece = { type: '金', owner: 'black' };
        expect(promote(piece)).toEqual(piece);
    });
});

describe('demote', () => {
    test('「と」を元に戻すと「歩」になる', () => {
        expect(demote('と')).toBe('歩');
    });

    test('「成香」を元に戻すと「香」になる', () => {
        expect(demote('成香')).toBe('香');
    });

    test('未定義の成りでない駒はそのまま返す', () => {
        expect(demote('金')).toBe('金');
    });
});

describe('shouldPromote', () => {
    test('敵陣に入るなら成れる（歩）', () => {
        const piece: Piece = { type: '歩', owner: 'black' };
        expect(shouldPromote(piece, 5, 2)).toBe(true);
    });

    test('敵陣にいなければ成れない（桂）', () => {
        const piece: Piece = { type: '桂', owner: 'white' };
        expect(shouldPromote(piece, 4, 5)).toBe(false);
    });

    test('金は成れない', () => {
        const piece: Piece = { type: '金', owner: 'black' };
        expect(shouldPromote(piece, 5, 2)).toBe(false);
    });
});

describe('getMovablePositions - 全ての駒の移動ロジックのテスト', () => {
    test('歩（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '歩', owner: 'black' };
        board[4][4] = piece;
        expect(getMovablePositions(piece, 4, 4, board)).toEqual([[3, 4]]);
    });

    test('金（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '金', owner: 'black' };
        board[4][4] = piece;
        expect(getMovablePositions(piece, 4, 4, board)).toEqual(expect.arrayContaining([
            [3, 4], [3, 3], [3, 5], [4, 3], [4, 5], [5, 4]
        ]));
    });

    test('銀（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '銀', owner: 'black' };
        board[4][4] = piece;
        expect(getMovablePositions(piece, 4, 4, board)).toEqual(expect.arrayContaining([
            [3, 4], [3, 3], [3, 5], [5, 3], [5, 5]
        ]));
    });

    test('桂（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '桂', owner: 'black' };
        board[4][4] = piece;
        expect(getMovablePositions(piece, 4, 4, board)).toEqual([[2, 3], [2, 5]]);
    });

    test('香（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '香', owner: 'black' };
        board[4][4] = piece;
        expect(getMovablePositions(piece, 4, 4, board)).toEqual([[3, 4], [2, 4], [1, 4], [0, 4]]);
    });

    test('角（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '角', owner: 'black' };
        board[4][4] = piece;
        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [2, 2], [1, 1], [0, 0],
            [3, 5], [2, 6], [1, 7], [0, 8],
            [5, 3], [6, 2], [7, 1], [8, 0],
            [5, 5], [6, 6], [7, 7], [8, 8]
        ]));
    });

    test('馬（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '馬', owner: 'black' };
        board[4][4] = piece;
        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [2, 2], [1, 1], [0, 0], [3, 5], [2, 6], [1, 7], [0, 8],
            [5, 3], [6, 2], [7, 1], [8, 0], [5, 5], [6, 6], [7, 7], [8, 8],
            [3, 4], [4, 3], [4, 5], [5, 4]
        ]));
    });

    test('飛（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '飛', owner: 'black' };
        board[4][4] = piece;
        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 4], [2, 4], [1, 4], [0, 4],
            [5, 4], [6, 4], [7, 4], [8, 4],
            [4, 3], [4, 2], [4, 1], [4, 0],
            [4, 5], [4, 6], [4, 7], [4, 8]
        ]));
    });

    test('龍（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '龍', owner: 'black' };
        board[4][4] = piece;
        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 4], [2, 4], [1, 4], [0, 4],
            [5, 4], [6, 4], [7, 4], [8, 4],
            [4, 3], [4, 2], [4, 1], [4, 0],
            [4, 5], [4, 6], [4, 7], [4, 8],
            [3, 3], [3, 5], [5, 3], [5, 5]
        ]));
    });

    test('飛車は他の駒にぶつかったらそこで止まる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '飛', owner: 'black' };
        board[4][4] = piece;
        board[2][4] = { type: '歩', owner: 'white' }; // 前方に相手の駒
        board[4][6] = { type: '歩', owner: 'black' }; // 右に味方の駒

        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 4], [2, 4], // 2,4 で止まる（相手の駒）
            [5, 4], [6, 4], [7, 4], [8, 4], // 下方向
            [4, 3], // 左方向
            // [4,6] は味方の駒なので含まれない
        ]));
        expect(result).not.toContainEqual([1, 4]); // 2,4 で止まる
        expect(result).not.toContainEqual([4, 6]); // 味方の上には行けない
    });

    test('角は他の駒にぶつかったらそこで止まる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '角', owner: 'black' };
        board[4][4] = piece;
        board[2][2] = { type: '歩', owner: 'white' };
        board[6][6] = { type: '歩', owner: 'black' };

        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [2, 2], // 相手の駒まで
            [5, 5], // 味方の前まで
        ]));
        expect(result).not.toContainEqual([1, 1]); // 2,2 で止まる
        expect(result).not.toContainEqual([6, 6]); // 味方の駒の位置
    });

    test('香車は他の駒にぶつかったらそこで止まる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '香', owner: 'black' };
        board[4][4] = piece;
        board[2][4] = { type: '歩', owner: 'white' };

        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual([[3, 4], [2, 4]]);
        expect(result).not.toContainEqual([1, 4]); // 2,4 で止まる
    });

    test('玉（black）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '玉', owner: 'black' };
        board[4][4] = piece;
        const result = getMovablePositions(piece, 4, 4, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [3, 4], [3, 5],
            [4, 3], [4, 5],
            [5, 3], [5, 4], [5, 5]
        ]));
    });
});