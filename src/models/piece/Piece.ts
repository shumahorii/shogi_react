import { Square } from '../../models/BoardState';

export type Player = 'black' | 'white';

export abstract class Piece {
    constructor(public owner: Player) { }

    // 駒の種類（例: 歩, 銀 など）
    abstract get type(): string;

    // 成り処理
    abstract promote(): Piece;

    // 成りから元の駒へ戻す
    abstract demote(): Piece;

    // 成れる条件の判定
    abstract shouldPromote(fromRow: number, toRow: number): boolean;

    // 駒ごとの移動可能マスのロジック
    abstract getMovablePositions(
        row: number,
        col: number,
        board: Square[][]
    ): [number, number][];

    // 共通の盤面チェック処理
    protected isInside(
        row: number,
        col: number,
        board: Square[][]
    ): boolean {
        return (
            row >= 0 &&
            row < 9 &&
            col >= 0 &&
            col < 9 &&
            (!board[row][col] || board[row][col]?.owner !== this.owner)
        );
    }
}