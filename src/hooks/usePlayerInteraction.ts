import { useCallback } from 'react';
import { Square } from '../models/BoardState';
import { Piece } from '../models/piece/Piece';
import { useGameJudge } from './useGameJudge';
import { addCapturedPiece, removeCapturedPiece } from '../logic/capturedPieceLogic';

export const usePlayerInteraction = ({
    board,
    setBoard,
    turn,
    setTurn,
    selectedPosition,
    setSelectedPosition,
    selectedHandPiece,
    setSelectedHandPiece,
    capturedPieces,
    setCapturedPieces,
    capturedPiecesWhite,
    setCapturedPiecesWhite,
    setIsGameOver,
    setPromotionChoice,
}: {
    board: Square[][];
    setBoard: (b: Square[][]) => void;
    turn: 'black' | 'white';
    setTurn: (t: 'black' | 'white') => void;
    selectedPosition: [number, number] | null;
    setSelectedPosition: (pos: [number, number] | null) => void;
    selectedHandPiece: string | null;
    setSelectedHandPiece: (p: string | null) => void;
    capturedPieces: Map<string, number>;
    setCapturedPieces: (m: Map<string, number>) => void;
    capturedPiecesWhite: Map<string, number>;
    setCapturedPiecesWhite: (m: Map<string, number>) => void;
    setIsGameOver: (b: boolean) => void;
    setPromotionChoice: (info: {
        from: [number, number];
        to: [number, number];
        piece: Piece;
    } | null) => void;
}) => {
    const { checkAndSetGameOver, checkOute } = useGameJudge({ setIsGameOver });

    const applyMove = useCallback(
        (from: [number, number], to: [number, number], piece: Piece) => {
            const newBoard = board.map(r => [...r]);
            const captured = board[to[0]][to[1]];

            if (captured && captured.owner !== piece.owner) {
                const type = captured.demote().type;
                const updated = piece.owner === 'black'
                    ? addCapturedPiece(capturedPieces, type)
                    : addCapturedPiece(capturedPiecesWhite, type);
                piece.owner === 'black'
                    ? setCapturedPieces(updated)
                    : setCapturedPiecesWhite(updated);
            }

            newBoard[to[0]][to[1]] = piece;
            newBoard[from[0]][from[1]] = null;
            setBoard(newBoard);

            setSelectedPosition(null);
            setSelectedHandPiece(null);
            setPromotionChoice(null);

            const nextTurn = piece.owner === 'black' ? 'white' : 'black';
            setTurn(nextTurn);

            if (!checkAndSetGameOver(newBoard)) {
                checkOute(newBoard, nextTurn);
            }
        },
        [
            board,
            capturedPieces,
            capturedPiecesWhite,
            setBoard,
            setCapturedPieces,
            setCapturedPiecesWhite,
            setSelectedPosition,
            setSelectedHandPiece,
            setPromotionChoice,
            setTurn,
            checkAndSetGameOver,
            checkOute,
        ]
    );

    const handleSquareClick = useCallback(
        (row: number, col: number) => {
            if (turn !== 'black') return;
            const clicked = board[row][col];

            if (selectedHandPiece && !clicked) {
                if (
                    selectedHandPiece === '歩' &&
                    board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'black')
                ) {
                    alert('二歩は禁止です');
                    return;
                }

                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = new (window as any)[selectedHandPiece]('black');
                setBoard(newBoard);

                const updated = removeCapturedPiece(capturedPieces, selectedHandPiece);
                setCapturedPieces(updated);

                setSelectedHandPiece(null);
                setTurn('white');
                return;
            }

            if (selectedPosition) {
                const [fr, fc] = selectedPosition;
                const piece = board[fr][fc];
                const legalMoves = piece?.getMovablePositions(fr, fc, board);
                const isLegal = legalMoves?.some(([r, c]) => r === row && c === col);

                if (isLegal) {
                    if (piece!.shouldPromote(fr, row)) {
                        setPromotionChoice({ from: [fr, fc], to: [row, col], piece: piece! });
                    } else {
                        applyMove([fr, fc], [row, col], piece!);
                    }
                } else {
                    setSelectedPosition(null);
                }
            } else if (clicked?.owner === 'black') {
                setSelectedPosition([row, col]);
                setSelectedHandPiece(null);
            }
        },
        [
            board,
            turn,
            selectedPosition,
            selectedHandPiece,
            setBoard,
            setSelectedPosition,
            setSelectedHandPiece,
            setCapturedPieces,
            setTurn,
            setPromotionChoice,
            applyMove,
            capturedPieces,
        ]
    );

    const handleHandPieceSelect = useCallback(
        (type: string) => {
            setSelectedHandPiece(type);
            setSelectedPosition(null);
        },
        [setSelectedHandPiece, setSelectedPosition]
    );

    return {
        handleSquareClick,
        handleHandPieceSelect,
        applyMove,
    };
};
