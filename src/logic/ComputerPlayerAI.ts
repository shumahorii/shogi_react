import { Square } from '../models/BoardState';
import { Piece } from '../models/piece/Piece';

const pieceValueMap: Record<string, number> = {
    '歩': 1,
    'と': 2,
    '銀': 3,
    '成銀': 4,
    '桂': 3,
    '成桂': 4,
    '香': 3,
    '成香': 4,
    '金': 5,
    '角': 6,
    '馬': 8,
    '飛': 7,
    '龍': 9,
    '玉': 0,
};

const findKing = (board: Square[][], player: 'black' | 'white'): [number, number] | null => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === player && piece.type === '玉') {
                return [r, c];
            }
        }
    }
    return null;
};

const isThreatenedByWhite = (board: Square[][], row: number, col: number): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === 'white') {
                const moves = piece.getMovablePositions(r, c, board);
                if (moves.some(([mr, mc]) => mr === row && mc === col)) {
                    return true;
                }
            }
        }
    }
    return false;
};

const isThreatenedByBlack = (board: Square[][], row: number, col: number): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === 'black') {
                const moves = piece.getMovablePositions(r, c, board);
                if (moves.some(([mr, mc]) => mr === row && mc === col)) {
                    return true;
                }
            }
        }
    }
    return false;
};

const isCheckmate = (board: Square[][]): boolean => {
    const kingPos = findKing(board, 'black');
    if (!kingPos) return true;

    const [r, c] = kingPos;
    const escapeMoves = board[r][c]?.getMovablePositions(r, c, board) || [];

    return escapeMoves.every(([er, ec]) => isThreatenedByWhite(board, er, ec));
};

export const getSmartComputerMove = (board: Square[][]): {
    from: [number, number];
    to: [number, number];
    piece: Piece;
} | null => {
    let bestMove: { from: [number, number]; to: [number, number]; piece: Piece } | null = null;
    let bestScore = -Infinity;

    board.forEach((row, r) =>
        row.forEach((square, c) => {
            if (square && square.owner === 'white') {
                const moves = square.getMovablePositions(r, c, board);

                moves.forEach(([toR, toC]) => {
                    const target = board[toR][toC];

                    const simulatedBoard = board.map(row => [...row]);
                    simulatedBoard[toR][toC] = square;
                    simulatedBoard[r][c] = null;

                    if (isCheckmate(simulatedBoard)) {
                        bestMove = { from: [r, c], to: [toR, toC], piece: square };
                        bestScore = Infinity;
                        return;
                    }

                    const captureScore = target && target.owner === 'black'
                        ? pieceValueMap[target.type] || 0
                        : 0;

                    const isThreatened = isThreatenedByBlack(simulatedBoard, toR, toC);
                    const safetyBonus = isThreatened ? -2 : 1;

                    const totalScore = captureScore + safetyBonus;

                    if (totalScore > bestScore) {
                        bestScore = totalScore;
                        bestMove = { from: [r, c], to: [toR, toC], piece: square };
                    }
                });
            }
        })
    );

    return bestMove;
};

export const getSmartComputerDrop = (
    board: Square[][],
    capturedPieces: Map<string, number>
): { to: [number, number]; type: string } | null => {
    for (const [type, count] of capturedPieces.entries()) {
        if (count <= 0) continue;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === null) {
                    if (
                        type === '歩' &&
                        board.some(r => r[col]?.type === '歩' && r[col]?.owner === 'white')
                    ) continue;

                    if ((type === '桂' || type === '香') && row === 8) continue;

                    return { to: [row, col], type };
                }
            }
        }
    }
    return null;
};

export const getRandomComputerMove = (board: Square[][]): {
    from: [number, number];
    to: [number, number];
    piece: Piece;
} | null => {
    const allMoves: {
        from: [number, number];
        to: [number, number];
        piece: Piece;
    }[] = [];

    board.forEach((row, r) =>
        row.forEach((square, c) => {
            if (square && square.owner === 'white') {
                const moves = square.getMovablePositions(r, c, board);

                moves.forEach(([toR, toC]) => {
                    allMoves.push({
                        from: [r, c],
                        to: [toR, toC],
                        piece: square,
                    });
                });
            }
        })
    );

    if (allMoves.length === 0) return null;

    return allMoves[Math.floor(Math.random() * allMoves.length)];
};