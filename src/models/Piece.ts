// 駒の持ち主（プレイヤー）は 'black'（先手）または 'white'（後手）
export type Player = 'black' | 'white';

// Piece型は1つの駒を表す（種類typeと持ち主ownerを持つ）
export interface Piece {
    type: string;   // 駒の種類（例：'歩', '銀', '飛' など）
    owner: Player;  // 駒の所有者（先手か後手か）
}