import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { PromotedPawn } from './PromotedPawn';

export class Pawn extends Piece {
    get type(): string {
        return '歩';
    }

    promote(): Piece {
        return new PromotedPawn(this.owner);
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
        const r = row + dir;
        if (this.isInside(r, col, board)) {
            return [[r, col]];
        }
        return [];
    }
}