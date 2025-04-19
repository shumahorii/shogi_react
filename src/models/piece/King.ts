import { Piece, Player } from './Piece';
import { Square } from '../BoardState';

export class King extends Piece {
    constructor(owner: Player) {
        super(owner);
    }

    get type(): string {
        return '玉';
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const positions: [number, number][] = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (this.isInside(r, c, board)) positions.push([r, c]);
            }
        }
        return positions;
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
}