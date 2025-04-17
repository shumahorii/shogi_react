// テスト対象: getMovablePositions関数（駒ごとの移動可能マスを判定）
import { Piece } from '../models/Piece';
import { Square } from '../models/BoardState';
import { getMovablePositions } from '../logic/pieceLogic';

describe('getMovablePositions', () => {
    /**
     * テスト用の空の将棋盤（9×9 すべて null）を作成するヘルパー関数
     */
    const createEmptyBoard = (): Square[][] =>
        Array.from({ length: 9 }, () => Array(9).fill(null));

    const center: [number, number] = [4, 4]; // 中央座標に駒を置いてテストする

    const place = (board: Square[][], piece: Piece) => {
        board[center[0]][center[1]] = piece;
    };

    test('歩（black）は前に1マスだけ進める', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '歩', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual([[3, 4]]);
    });

    test('金（black）は前後左右＋斜め前に動ける', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '金', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[3, 4], [3, 3], [3, 5], [4, 3], [4, 5], [5, 4]]));
    });

    test('銀（black）は前と斜めに動ける', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '銀', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[3, 4], [3, 3], [3, 5], [5, 3], [5, 5]]));
    });

    test('桂（black）は2マス前に跳ねる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '桂', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[2, 3], [2, 5]]));
    });

    test('角（black）は斜めに連続して進める', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '角', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [2, 2], [1, 1], [0, 0],
            [3, 5], [2, 6], [1, 7], [0, 8],
            [5, 3], [6, 2], [7, 1], [8, 0],
            [5, 5], [6, 6], [7, 7], [8, 8],
        ]));
    });

    test('飛（black）は縦横に連続して進める', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '飛', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 4], [2, 4], [1, 4], [0, 4],
            [5, 4], [6, 4], [7, 4], [8, 4],
            [4, 3], [4, 2], [4, 1], [4, 0],
            [4, 5], [4, 6], [4, 7], [4, 8],
        ]));
    });

    test('玉（black）は8方向に1マスだけ進める', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '玉', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [3, 4], [3, 5],
            [4, 3], [4, 5],
            [5, 3], [5, 4], [5, 5],
        ]));
    });

    test('成銀（black）は金と同じ動きができる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '成銀', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[3, 4], [3, 3], [3, 5], [4, 3], [4, 5], [5, 4]]));
    });

    test('成桂（black）も金と同じ動きができる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '成桂', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[3, 4], [3, 3], [3, 5], [4, 3], [4, 5], [5, 4]]));
    });

    test('と金（black）も金と同じ動きができる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: 'と', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([[3, 4], [3, 3], [3, 5], [4, 3], [4, 5], [5, 4]]));
    });

    test('馬（成角）は斜め無限 + 王のような1マス移動ができる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '馬', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 3], [2, 2], [1, 1], [0, 0],
            [3, 5], [2, 6], [1, 7], [0, 8],
            [5, 3], [6, 2], [7, 1], [8, 0],
            [5, 5], [6, 6], [7, 7], [8, 8],
            [3, 4], [4, 3], [4, 5], [5, 4], // 王の動き分
        ]));
    });

    test('龍（成飛）は縦横無限 + 王のような1マス移動ができる', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '龍', owner: 'black' };
        place(board, piece);
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toEqual(expect.arrayContaining([
            [3, 4], [2, 4], [1, 4], [0, 4],
            [5, 4], [6, 4], [7, 4], [8, 4],
            [4, 3], [4, 2], [4, 1], [4, 0],
            [4, 5], [4, 6], [4, 7], [4, 8],
            [3, 3], [3, 5], [5, 3], [5, 5], // 王の動き分（斜め）
        ]));
    });

    test('自分の駒がいるマスには移動できない', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '金', owner: 'black' };
        const blocker: Piece = { type: '歩', owner: 'black' };
        place(board, piece);
        board[3][4] = blocker; // 前に自分の駒がある
        const result = getMovablePositions(piece, ...center, board);
        expect(result).not.toContainEqual([3, 4]);
    });

    test('相手の駒がいるマスには移動できる（取りに行ける）', () => {
        const board = createEmptyBoard();
        const piece: Piece = { type: '金', owner: 'black' };
        const opponent: Piece = { type: '歩', owner: 'white' };
        place(board, piece);
        board[3][4] = opponent;
        const result = getMovablePositions(piece, ...center, board);
        expect(result).toContainEqual([3, 4]);
    });
});
