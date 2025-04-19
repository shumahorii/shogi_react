import { hasKing, isInCheck } from '../logic/gameJudge';
import { Square } from '../models/BoardState';
import { Piece } from '../models/piece/Piece';

const createEmptyBoard = (): Square[][] =>
    Array.from({ length: 9 }, () => Array(9).fill(null));

describe('hasKing', () => {
    test('盤上に自分の玉がある場合は true', () => {
        const board = createEmptyBoard();
        board[0][0] = { type: '玉', owner: 'black' };
        expect(hasKing(board, 'black')).toBe(true);
    });

    test('盤上に自分の玉がない場合は false', () => {
        const board = createEmptyBoard();
        board[0][0] = { type: '玉', owner: 'white' };
        expect(hasKing(board, 'black')).toBe(false);
    });
});

describe('isInCheck', () => {
    test('敵の駒から王が攻撃されている場合は true', () => {
        const board = createEmptyBoard();
        const king: Piece = { type: '玉', owner: 'black' };
        const attacker: Piece = { type: '歩', owner: 'white' };

        board[4][4] = king;       // 黒の王
        board[3][4] = attacker;   // 白の歩（下から王を攻撃）

        expect(isInCheck(board, 'black')).toBe(true);
    });

    test('敵の駒が王を攻撃できない位置にある場合は false', () => {
        const board = createEmptyBoard();
        const king: Piece = { type: '玉', owner: 'black' };
        const attacker: Piece = { type: '歩', owner: 'white' };

        board[4][4] = king;
        board[2][4] = attacker; // 位置が遠くて攻撃できない

        expect(isInCheck(board, 'black')).toBe(false);
    });

    test('王がいない（既に取られている）場合は false', () => {
        const board = createEmptyBoard();
        const attacker: Piece = { type: '飛', owner: 'white' };

        board[0][4] = attacker;

        expect(isInCheck(board, 'black')).toBe(false);
    });
});