import { useCallback } from 'react';
import { Square } from '../models/BoardState';
import { Piece } from '../models/Piece';
import { useGameJudge } from './useGameJudge';
import { getMovablePositions, shouldPromote, demote } from '../logic/pieceLogic';

/**
 * 駒のクリック、移動、持ち駒の打ち処理を担当するカスタムフック
 * App.tsx からロジックを分離し、ユーザー操作に関する責務を一手に引き受ける
 */
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
    // 勝敗・王手判定用フック
    const { checkAndSetGameOver, checkOute } = useGameJudge({ setIsGameOver });

    /**
     * 駒を盤面上で移動させる関数。
     * 以下の処理をまとめて行う：
     * - 駒の移動
     * - 駒を取った場合の処理（持ち駒として追加）
     * - 盤面更新
     * - ターンの切り替え
     * - 勝敗チェック
     * - 王手チェック
     *
     * @param from 移動元の座標 [行, 列]
     * @param to 移動先の座標 [行, 列]
     * @param piece 実際に動かす駒の情報
     */
    const applyMove = useCallback(
        (from: [number, number], to: [number, number], piece: Piece) => {
            // 現在の盤面をディープコピー（元の状態を壊さないように）
            const newBoard = board.map(r => [...r]);

            // 移動先に相手の駒がいるかどうか確認
            const captured = board[to[0]][to[1]];

            // 相手の駒がいた場合は持ち駒に加える
            if (captured && captured.owner !== piece.owner) {
                // 成った駒は元に戻してから持ち駒にする（例：「と」→「歩」）
                const type = demote(captured.type);

                // どちらのプレイヤーが取ったかによって、管理対象の持ち駒セットを切り替える
                const map = piece.owner === 'black' ? capturedPieces : capturedPiecesWhite;
                const setMap = piece.owner === 'black' ? setCapturedPieces : setCapturedPiecesWhite;

                // Mapをコピーして更新
                const updated = new Map(map);
                updated.set(type, (updated.get(type) || 0) + 1); // 個数を加算
                setMap(updated); // 状態を更新
            }

            // 駒を盤面上で移動（移動先に配置し、元の位置をnullにする）
            newBoard[to[0]][to[1]] = piece;
            newBoard[from[0]][from[1]] = null;
            setBoard(newBoard); // 新しい盤面を反映

            // UI状態のリセット（選択解除、手駒選択解除、成りモーダル解除）
            setSelectedPosition(null);
            setSelectedHandPiece(null);
            setPromotionChoice(null);

            // ターンを相手側に切り替え（black → white または white → black）
            const nextTurn = piece.owner === 'black' ? 'white' : 'black';
            setTurn(nextTurn);

            // 勝敗のチェック（どちらかの玉が取られていないか）
            if (!checkAndSetGameOver(newBoard)) {
                // ゲームが続く場合は王手かどうかもチェックする
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
     * マスをクリックしたときの処理（持ち駒の打ち or 駒の選択 or 駒の移動）
     */
    const handleSquareClick = useCallback(
        (row: number, col: number) => {
            if (turn !== 'black') return;

            const clicked = board[row][col];

            // 持ち駒を打つ処理
            if (selectedHandPiece && !clicked) {
                // 二歩禁止：同じ列にすでに自分の歩がある場合
                if (
                    selectedHandPiece === '歩' &&
                    board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'black')
                ) {
                    alert('二歩は禁止です');
                    return;
                }

                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = { type: selectedHandPiece, owner: 'black' };
                setBoard(newBoard);

                const updated = new Map(capturedPieces);
                updated.set(selectedHandPiece, (updated.get(selectedHandPiece) || 0) - 1);
                if (updated.get(selectedHandPiece)! <= 0) updated.delete(selectedHandPiece);
                setCapturedPieces(updated);

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
                    // ✅ 修正ポイント：成れる場合だけモーダルを出す
                    if (shouldPromote(piece!, fr, row)) {
                        setPromotionChoice({
                            from: [fr, fc],
                            to: [row, col],
                            piece: piece!,
                        });
                    } else {
                        applyMove([fr, fc], [row, col], piece!);
                    }
                } else {
                    // 移動できないなら選択解除
                    setSelectedPosition(null);
                }
            }

            // 駒の選択処理（自分の駒をクリックした場合）
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
     * 手駒を選択したときの処理
     */
    const handleHandPieceSelect = useCallback(
        (type: string) => {
            setSelectedHandPiece(type);
            setSelectedPosition(null);
        },
        [setSelectedHandPiece, setSelectedPosition]
    );

    // 外部に公開する操作関数たち
    return {
        handleSquareClick,
        handleHandPieceSelect,
        applyMove,
    };
};