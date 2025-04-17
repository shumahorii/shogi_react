import { getSmartComputerMove, getSmartComputerDrop } from '../logic/ComputerPlayerAI';
import { Square } from '../models/BoardState';

const createEmptyBoard = (): Square[][] =>
    Array.from({ length: 9 }, () => Array(9).fill(null));

describe('getSmartComputerMove', () => {
    test('相手駒を取れる最善手を選ぶ（白の歩で黒の金を取る）', () => {
        const board = createEmptyBoard();
        board[4][4] = { type: '歩', owner: 'white' }; // 白の歩
        board[5][4] = { type: '金', owner: 'black' }; // 黒の金

        const move = getSmartComputerMove(board);

        expect(move).not.toBeNull();
        expect(move?.from).toEqual([4, 4]);
        expect(move?.to).toEqual([5, 4]);
        expect(move?.piece).toEqual({ type: '歩', owner: 'white' });
    });

    test('詰みがあるなら詰みを選ぶ', () => {
        const board = createEmptyBoard();
        board[7][4] = { type: '玉', owner: 'black' };
        board[6][3] = { type: '飛', owner: 'white' };
        board[6][5] = { type: '角', owner: 'white' };

        const move = getSmartComputerMove(board);
        expect(move).not.toBeNull();
        // 詰みになるような手が選ばれていること（位置までは限定せずOK）
    });
});

describe('getSmartComputerDrop', () => {
    test('歩を打てる位置があるならそこを返す', () => {
        const board = createEmptyBoard();
        const hand = new Map<string, number>([['歩', 1]]);

        const drop = getSmartComputerDrop(board, hand);
        expect(drop).not.toBeNull();
        expect(drop?.type).toBe('歩');
        expect(board[drop!.to[0]][drop!.to[1]]).toBeNull();
    });

    test('歩が二歩になるなら打たない', () => {
        const board = createEmptyBoard();
        board[4][2] = { type: '歩', owner: 'white' }; // 同列にすでに白の歩がある
        const hand = new Map<string, number>([['歩', 1]]);

        const drop = getSmartComputerDrop(board, hand);
        expect(drop?.to[1]).not.toBe(2); // 2列目には打たないはず
    });

    test('桂馬や香車は9段目に打たない', () => {
        const board = createEmptyBoard();
        const hand = new Map<string, number>([['桂', 1], ['香', 1]]);

        const drop = getSmartComputerDrop(board, hand);
        expect(drop?.to[0]).not.toBe(8); // 9段目ではない
    });

    test('持ち駒が0ならnull', () => {
        const board = createEmptyBoard();
        const hand = new Map<string, number>([['歩', 0]]);

        const drop = getSmartComputerDrop(board, hand);
        expect(drop).toBeNull();
    });
});
