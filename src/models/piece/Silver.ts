import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { PromotedSilver } from './PromotedSilver';

export class Silver extends Piece {
    get type(): string {
        return '銀';
    }

    promote(): Piece {
        return new PromotedSilver(this.owner);
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

        const directions: [number, number][] = [
            [dir, 0], [dir, -1], [dir, 1],
            [-dir, -1], [-dir, 1],
        ];

        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            if (this.isInside(r, c, board)) {
                moves.push([r, c]);
            }
        }

        return moves;
    }
}