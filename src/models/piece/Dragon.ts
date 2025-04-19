import { Piece, Player } from './Piece';
import { Square } from '../BoardState';

export class Dragon extends Piece {
    constructor(owner: Player) {
        super(owner);
    }

    get type(): string {
        return '龍';
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const positions: [number, number][] = [];

        // 飛車の縦横
        const orthogonals = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of orthogonals) {
            for (let i = 1; i < 9; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (!this.isInside(r, c, board)) break;
                positions.push([r, c]);
                if (board[r][c]) break;
            }
        }

        // 斜め方向に1マス
        const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of diagonals) {
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
        return new (require('./Rook').Rook)(this.owner);
    }

    shouldPromote(): boolean {
        return false;
    }
}