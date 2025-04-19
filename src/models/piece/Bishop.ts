import { Piece, Player } from './Piece';
import { Square } from '../BoardState';

export class Bishop extends Piece {
    constructor(owner: Player) {
        super(owner);
    }

    // ✅ 抽象メンバーの実装（駒の種類を返す）
    get type(): string {
        return '角';
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        const positions: [number, number][] = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 9; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (!this.isInside(r, c, board)) break;
                positions.push([r, c]);
                if (board[r][c]) break; // 他の駒がいたらストップ
            }
        }

        return positions;
    }

    promote(): Piece {
        // 成った場合は Horse クラス（馬）として返す
        return new (require('./Horse').Horse)(this.owner);
    }

    demote(): Piece {
        // Bishopは元から非成りなので demote してもそのまま
        return this;
    }

    shouldPromote(fromRow: number, toRow: number): boolean {
        const zone = this.owner === 'black' ? [0, 1, 2] : [6, 7, 8];
        return zone.includes(fromRow) || zone.includes(toRow);
    }
}