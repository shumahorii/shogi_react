import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { PromotedLance } from './PromotedLance';

export class Lance extends Piece {
    get type(): string {
        return '香';
    }

    promote(): Piece {
        return new PromotedLance(this.owner);
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

        for (let i = 1; i < 9; i++) {
            const r = row + i * dir;
            if (!this.isInside(r, col, board)) break;
            moves.push([r, col]);
            if (board[r][col]) break; // ← 駒にぶつかったらループ終了
        }

        return moves;
    }
}