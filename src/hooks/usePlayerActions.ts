// 将棋の盤面の各マス（Square型）をインポート
import { Square } from "../models/BoardState";
// 駒の情報を表す型 Piece をインポート
import { Piece } from "../models/Piece";

/**
 * プレイヤーの操作（駒を動かす、駒を取って持ち駒にするなど）をまとめたカスタムフック
 * @param board 現在の盤面（二次元配列）
 * @param setBoard 盤面を更新する関数（Reactのステート更新関数）
 * @param setTurn ターン（先手 or 後手）を切り替える関数
 * @param capturedPieces 現在の持ち駒（Map<駒の種類, 個数>）
 * @param setCapturedPieces 持ち駒を更新する関数
 */
export const usePlayerActions = ({
    board,                    // 現在の盤面状態
    setBoard,                 // 盤面を更新する関数
    setTurn,                  // 手番（黒/白）を更新する関数
    capturedPieces,           // 自分の持ち駒の状態
    setCapturedPieces         // 持ち駒の更新関数
}: {
    board: Square[][];                                      // 二次元盤面配列
    setBoard: (b: Square[][]) => void;                      // ステート更新関数（盤面）
    setTurn: (t: 'black' | 'white') => void;                // ステート更新関数（手番）
    capturedPieces: Map<string, number>;                    // 手持ち駒（Map形式）
    setCapturedPieces: (m: Map<string, number>) => void;    // ステート更新関数（持ち駒）
}) => {

    /**
     * 成った駒を元の駒に戻すためのマッピング関数
     * 例：「と」→「歩」、「馬」→「角」など
     */
    const getOriginalType = (type: string): string => {
        const reverseMap: Record<string, string> = {
            'と': '歩',
            '成銀': '銀',
            '成桂': '桂',
            '馬': '角',
            '龍': '飛',
        };
        return reverseMap[type] || type; // 成りでなければそのまま返す
    };

    /**
     * 駒を取ったときに「自分の持ち駒」として追加する関数
     * 成り駒を元の種類に戻して追加
     * @param p 取った駒
     */
    const capturePiece = (p: Piece) => {
        const type = getOriginalType(p.type); // 成りを元に戻す
        const updated = new Map(capturedPieces); // 持ち駒のコピーを作成
        updated.set(type, (updated.get(type) || 0) + 1); // 個数を加算
        setCapturedPieces(updated); // ステート更新
    };

    /**
     * 駒を盤面上で移動させる関数（駒を動かし、相手の駒がいれば取得）
     * @param from 移動元座標 [行, 列]
     * @param to 移動先座標 [行, 列]
     * @param piece 移動させる駒の情報
     */
    const applyMove = (from: [number, number], to: [number, number], piece: Piece) => {
        // 盤面をディープコピー（変更の影響を与えないように）
        const newBoard = board.map(r => [...r]);

        // 移動先に相手の駒がいる場合は取得
        const target = board[to[0]][to[1]];
        if (target && target.owner !== piece.owner && piece.owner === 'black') {
            capturePiece(target); // 黒（プレイヤー）の場合のみ持ち駒に追加
        }

        // 駒を移動（新しい位置に配置、元の位置は空に）
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;

        // 盤面とターンを更新
        setBoard(newBoard);
        setTurn(piece.owner === 'black' ? 'white' : 'black'); // 手番を交代
    };

    // 外から使える関数として export
    return { applyMove, capturePiece };
};