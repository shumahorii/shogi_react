import { Piece } from './Piece';
import { Square } from '../../models/BoardState';

export class Gold extends Piece {
    get type(): string {
        return '金';
    }

    promote(): Piece {
        return this;
    }

    demote(): Piece {
        return this;
    }

    shouldPromote(): boolean {
        return false;
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const dir = this.owner === 'black' ? -1 : 1;
        const moves: [number, number][] = [];

        const directions: [number, number][] = [
            [dir, 0], [dir, -1], [dir, 1],
            [0, -1], [0, 1], [-dir, 0],
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
