import { Piece, Player } from './Piece';
import { Square } from '../BoardState';

export class Horse extends Piece {
    constructor(owner: Player) {
        super(owner);
    }

    get type(): string {
        return '馬';
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const positions: [number, number][] = [];

        // 角の斜め方向
        const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of diagonals) {
            for (let i = 1; i < 9; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (!this.isInside(r, c, board)) break;
                positions.push([r, c]);
                if (board[r][c]) break;
            }
        }

        // 金と同じく1マス移動（縦横）
        const extras = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of extras) {
            const r = row + dr;
            const c = col + dc;
            if (this.isInside(r, c, board)) positions.push([r, c]);
        }

        return positions;
    }

    promote(): Piece {
        return this;
    }

    demote(): Piece {
        return new (require('./Bishop').Bishop)(this.owner);
    }

    shouldPromote(): boolean {
        return false;
    }
}