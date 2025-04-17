// capturedPieceUtils.test.ts

import {
    addCapturedPiece,
    removeCapturedPiece,
    hasCapturedPiece
} from '../logic/capturedPieceLogic';

describe('capturedPieceUtils', () => {
    describe('addCapturedPiece', () => {
        test('駒が存在しない場合は1として追加される', () => {
            const map = new Map<string, number>();
            const result = addCapturedPiece(map, '銀');

            expect(result.get('銀')).toBe(1);
            expect(map.has('銀')).toBe(false); // 元のMapは変更されない
        });

        test('すでに存在する駒は数が1増える', () => {
            const map = new Map<string, number>([['銀', 2]]);
            const result = addCapturedPiece(map, '銀');

            expect(result.get('銀')).toBe(3);
        });
    });

    describe('removeCapturedPiece', () => {
        test('1つだけある駒は削除される', () => {
            const map = new Map<string, number>([['歩', 1]]);
            const result = removeCapturedPiece(map, '歩');

            expect(result.has('歩')).toBe(false);
        });

        test('2つ以上ある駒は数が1減る', () => {
            const map = new Map<string, number>([['桂', 3]]);
            const result = removeCapturedPiece(map, '桂');

            expect(result.get('桂')).toBe(2);
        });

        test('対象の駒が存在しない場合は変化なし', () => {
            const map = new Map<string, number>([['金', 1]]);
            const result = removeCapturedPiece(map, '銀');

            expect(result.get('金')).toBe(1);
            expect(result.has('銀')).toBe(false);
        });
    });

    describe('hasCapturedPiece', () => {
        test('駒が1個以上ある場合はtrue', () => {
            const map = new Map<string, number>([['角', 1]]);
            expect(hasCapturedPiece(map, '角')).toBe(true);
        });

        test('駒が0または存在しない場合はfalse', () => {
            const map = new Map<string, number>([['飛', 0]]);
            expect(hasCapturedPiece(map, '飛')).toBe(false);
            expect(hasCapturedPiece(map, '桂')).toBe(false);
        });
    });
});
