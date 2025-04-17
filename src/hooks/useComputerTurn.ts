import { useEffect } from 'react';
import { Square } from '../models/BoardState';
import { getSmartComputerDrop, getSmartComputerMove } from '../logic/ComputerPlayerAI';
import { removeCapturedPiece } from '../logic/capturedPieceLogic';

/**
 * コンピュータ（後手）の手番を処理するカスタムフック
 * useEffect を使って、ターンが 'white' になったタイミングで自動的に指し手を実行する
 */
export const useComputerTurn = ({
    board,                                 // 現在の盤面状態
    turn,                                  // 現在の手番（black/white）
    setBoard,                              // 盤面を更新する関数
    capturedPiecesWhite,                   // コンピュータ側の持ち駒
    setCapturedPiecesWhite,               // 持ち駒を更新する関数
    applyMove,                             // 駒を移動させる共通関数（捕獲・終了処理含む）
    isGameOver,                            // ゲームが終了していれば何もしない
    setTurn,                               // 手番を変更するための関数（主に白→黒）
}: {
    board: Square[][];
    turn: 'black' | 'white';
    setBoard: (b: Square[][]) => void;
    capturedPiecesWhite: Map<string, number>;
    setCapturedPiecesWhite: (m: Map<string, number>) => void;
    applyMove: (from: [number, number], to: [number, number], piece: any) => void;
    isGameOver: boolean;
    setTurn: (t: 'black' | 'white') => void;
}) => {
    useEffect(() => {
        // 手番が white（コンピュータ）かつゲーム中の場合にのみ処理を実行
        if (turn === 'white' && !isGameOver) {
            setTimeout(() => {
                // まず通常の駒を使った移動手を探索
                const move = getSmartComputerMove(board);

                if (move) {
                    // 移動できる場合は applyMove に任せる
                    applyMove(move.from, move.to, move.piece);
                } else {
                    // 移動できない場合、持ち駒を打てる位置を探索
                    const drop = getSmartComputerDrop(board, capturedPiecesWhite);
                    if (drop) {
                        const newBoard = board.map(r => [...r]);
                        newBoard[drop.to[0]][drop.to[1]] = {
                            type: drop.type,
                            owner: 'white',
                        };
                        setBoard(newBoard);

                        // 持ち駒を減らす
                        const updated = removeCapturedPiece(capturedPiecesWhite, drop.type);
                        setCapturedPiecesWhite(updated);

                        setTurn('black'); // プレイヤーの番に交代
                    }
                }
            }, 500); // 少し間を置いて自然な思考感を出す
        }
    }, [
        turn,
        isGameOver,
        board,
        applyMove,
        capturedPiecesWhite,
        setBoard,
        setCapturedPiecesWhite,
        setTurn,
    ]);
};