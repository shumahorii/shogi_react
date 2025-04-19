import { useEffect } from 'react';
import { Square } from '../models/BoardState';
import { getSmartComputerDrop, getSmartComputerMove } from '../logic/ComputerPlayerAI';
import { removeCapturedPiece } from '../logic/capturedPieceLogic';
import { Piece } from '../models/piece/Piece'; // ← 抽象クラス
import { Pawn } from '../models/piece/Pawn';
import { Silver } from '../models/piece/Silver';
import { Knight } from '../models/piece/Knight';
import { Lance } from '../models/piece/Lance';
import { Gold } from '../models/piece/Gold';
import { Bishop } from '../models/piece/Bishop';
import { Rook } from '../models/piece/Rook';

/**
 * 駒の種類に応じた具象クラスのインスタンスを生成する関数
 */
const createPieceInstance = (type: string, owner: 'black' | 'white'): Piece => {
    switch (type) {
        case '歩':
            return new Pawn(owner);
        case '銀':
            return new Silver(owner);
        case '桂':
            return new Knight(owner);
        case '香':
            return new Lance(owner);
        case '金':
            return new Gold(owner);
        case '角':
            return new Bishop(owner);
        case '飛':
            return new Rook(owner);
        default:
            throw new Error(`未対応の駒タイプ: ${type}`);
    }
};

export const useComputerTurn = ({
    board,
    turn,
    setBoard,
    capturedPiecesWhite,
    setCapturedPiecesWhite,
    applyMove,
    isGameOver,
    setTurn,
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
        if (turn === 'white' && !isGameOver) {
            setTimeout(() => {
                const move = getSmartComputerMove(board);

                if (move) {
                    applyMove(move.from, move.to, move.piece);
                } else {
                    const drop = getSmartComputerDrop(board, capturedPiecesWhite);
                    if (drop) {
                        const newBoard = board.map(r => [...r]);
                        const piece = createPieceInstance(drop.type, 'white');
                        newBoard[drop.to[0]][drop.to[1]] = piece;
                        setBoard(newBoard);

                        const updated = removeCapturedPiece(capturedPiecesWhite, drop.type);
                        setCapturedPiecesWhite(updated);

                        setTurn('black');
                    }
                }
            }, 500);
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