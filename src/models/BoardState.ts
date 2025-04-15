import { Piece } from './Piece';

export type Square = Piece | null;

export const createInitialBoard = (): Square[][] => {
    const emptyRow = Array(9).fill(null);
    return [
        [
            { type: '香', owner: 'white' }, { type: '桂', owner: 'white' }, { type: '銀', owner: 'white' },
            { type: '金', owner: 'white' }, { type: '玉', owner: 'white' }, { type: '金', owner: 'white' },
            { type: '銀', owner: 'white' }, { type: '桂', owner: 'white' }, { type: '香', owner: 'white' },
        ],
        [
            null, { type: '飛', owner: 'white' }, null,
            null, null, null,
            null, { type: '角', owner: 'white' }, null,
        ],
        Array(9).fill({ type: '歩', owner: 'white' }),
        ...Array(3).fill(emptyRow),
        Array(9).fill({ type: '歩', owner: 'black' }),
        [
            null, { type: '角', owner: 'black' }, null,
            null, null, null,
            null, { type: '飛', owner: 'black' }, null,
        ],
        [
            { type: '香', owner: 'black' }, { type: '桂', owner: 'black' }, { type: '銀', owner: 'black' },
            { type: '金', owner: 'black' }, { type: '玉', owner: 'black' }, { type: '金', owner: 'black' },
            { type: '銀', owner: 'black' }, { type: '桂', owner: 'black' }, { type: '香', owner: 'black' },
        ],
    ];
};
