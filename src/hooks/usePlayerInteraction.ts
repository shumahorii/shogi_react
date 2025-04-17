import { useCallback } from 'react';
import { Square } from '../models/BoardState';
import { Piece } from '../models/Piece';
import { useGameJudge } from './useGameJudge';
import { getMovablePositions, shouldPromote } from '../logic/pieceLogic';
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
    // 勝敗と王手をチェックするための判定ロジックを含むカスタムフック
    const { checkAndSetGameOver, checkOute } = useGameJudge({ setIsGameOver });

    /**
     * 駒を盤面上で移動させる処理。
     * - 盤面の更新
     * - 駒を取った場合の持ち駒への追加
     * - 手番の切り替え
     * - ゲームの終了チェック
     * - 王手チェック
     */
    const applyMove = useCallback(
        (from: [number, number], to: [number, number], piece: Piece) => {
            const newBoard = board.map(r => [...r]);

            const captured = board[to[0]][to[1]];
            if (captured && captured.owner !== piece.owner) {
                // 駒を取った場合、どちらのプレイヤーかによって正しい持ち駒Mapに追加
                const type = captured.type;
                if (piece.owner === 'black') {
                    const updated = addCapturedPiece(capturedPieces, type);
                    setCapturedPieces(updated);
                } else {
                    const updated = addCapturedPiece(capturedPiecesWhite, type);
                    setCapturedPiecesWhite(updated);
                }
            }

            // 駒の移動を反映
            newBoard[to[0]][to[1]] = piece;
            newBoard[from[0]][from[1]] = null;
            setBoard(newBoard);

            // UI状態のリセット
            setSelectedPosition(null);
            setSelectedHandPiece(null);
            setPromotionChoice(null);

            // 手番の切り替え
            const nextTurn = piece.owner === 'black' ? 'white' : 'black';
            setTurn(nextTurn);

            // 勝敗・王手のチェック
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

    /**
     * 盤面上のマスをクリックしたときに呼ばれる処理。
     * - 駒の選択
     * - 駒の移動
     * - 持ち駒の打ち込み
     */
    const handleSquareClick = useCallback(
        (row: number, col: number) => {
            if (turn !== 'black') return;

            const clicked = board[row][col];

            // 持ち駒を打つ処理
            if (selectedHandPiece && !clicked) {
                // 二歩の禁止チェック（同じ列に既に歩がある場合）
                if (
                    selectedHandPiece === '歩' &&
                    board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'black')
                ) {
                    alert('二歩は禁止です');
                    return;
                }

                // 新しい盤面に反映
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = { type: selectedHandPiece, owner: 'black' };
                setBoard(newBoard);

                // 持ち駒を1つ減らす（removeCapturedPieceを利用）
                const updated = removeCapturedPiece(capturedPieces, selectedHandPiece);
                setCapturedPieces(updated);

                // 状態更新
                setSelectedHandPiece(null);
                setTurn('white');
                return;
            }

            // 駒の移動処理
            if (selectedPosition) {
                const [fr, fc] = selectedPosition;
                const piece = board[fr][fc];
                const legalMoves = getMovablePositions(piece!, fr, fc, board);
                const isLegal = legalMoves.some(([r, c]) => r === row && c === col);

                if (isLegal) {
                    if (shouldPromote(piece!, fr, row)) {
                        // 成りモーダル表示
                        setPromotionChoice({ from: [fr, fc], to: [row, col], piece: piece! });
                    } else {
                        applyMove([fr, fc], [row, col], piece!);
                    }
                } else {
                    // 不正な移動先の場合は選択解除
                    setSelectedPosition(null);
                }
            }

            // 自分の駒をクリックした場合は選択状態に
            else if (clicked?.owner === 'black') {
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

    /**
     * 持ち駒のボタンをクリックしたときの処理。
     * 手駒を選択状態にし、盤上の駒の選択は解除。
     */
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