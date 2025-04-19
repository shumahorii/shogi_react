import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { PromotedKnight } from './PromotedKnight';

export class Knight extends Piece {
    get type(): string {
        return '桂';
    }

    promote(): Piece {
        return new PromotedKnight(this.owner);
    }

    demote(): Piece {
        return this;
    }

    shouldPromote(fromRow: number, toRow: number): boolean {
        const zone = this.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
        return zone.includes(fromRow) || zone.includes(toRow);
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const dir = this.owner === 'black' ? -1 : 1;
        const moves: [number, number][] = [];

        const r = row + 2 * dir;
        if (this.isInside(r, col - 1, board)) moves.push([r, col - 1]);
        if (this.isInside(r, col + 1, board)) moves.push([r, col + 1]);

        return moves;
    }
}