import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { Knight } from './Knight';
import { Gold } from './Gold';

export class PromotedKnight extends Piece {
    private goldLogic: Gold;

    constructor(owner: 'black' | 'white') {
        super(owner);
        this.goldLogic = new Gold(owner);
    }

    get type(): string {
        return '成桂';
    }

    promote(): Piece {
        return this;
    }

    demote(): Piece {
        return new Knight(this.owner);
    }

    shouldPromote(): boolean {
        return false;
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        return this.goldLogic.getMovablePositions(row, col, board);
    }
}