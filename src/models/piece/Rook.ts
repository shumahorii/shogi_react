import { Piece, Player } from './Piece';
import { Square } from '../BoardState';

export class Rook extends Piece {
    constructor(owner: Player) {
        super(owner);
    }

    get type(): string {
        return '飛';
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const positions: [number, number][] = [];
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 9; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (!this.isInside(r, c, board)) break;
                positions.push([r, c]);
                if (board[r][c]) break;
            }
        }

        return positions;
    }

    promote(): Piece {
        return new (require('./Dragon').Dragon)(this.owner);
    }

    demote(): Piece {
        return this;
    }

    shouldPromote(fromRow: number, toRow: number): boolean {
        const zone = this.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
        return zone.includes(fromRow) || zone.includes(toRow);
    }
}
