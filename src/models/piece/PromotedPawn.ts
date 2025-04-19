import { Piece } from './Piece';
import { Square } from '../../models/BoardState';
import { Pawn } from './Pawn';
import { Gold } from './Gold';

export class PromotedPawn extends Piece {
    private goldLogic: Gold;

    constructor(owner: 'black' | 'white') {
        super(owner);
        this.goldLogic = new Gold(owner);
    }

    get type(): string {
        return 'と';
    }

    promote(): Piece {
        return this;
    }

    demote(): Piece {
        return new Pawn(this.owner);
    }

    shouldPromote(): boolean {
        return false;
    }

    getMovablePositions(row: number, col: number, board: Square[][]): [number, number][] {
        return this.goldLogic.getMovablePositions(row, col, board);
    }
}