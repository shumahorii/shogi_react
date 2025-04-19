import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { Silver } from './Silver';
import { Gold } from './Gold';

export class PromotedSilver extends Piece {
    private goldLogic: Gold;

    constructor(owner: 'black' | 'white') {
        super(owner);
        this.goldLogic = new Gold(owner);
    }

    get type(): string {
        return '成銀';
    }

    promote(): Piece {
        return this;
    }

    demote(): Piece {
        return new Silver(this.owner);
    }

    shouldPromote(): boolean {
        return false;
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        return this.goldLogic.getMovablePositions(row, col, board);
    }
}