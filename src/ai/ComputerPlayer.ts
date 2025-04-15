import { Square } from '../models/BoardState';
import { getMovablePositions, Piece } from '../models/Piece';

/**
 * コンピューターの手（後手）として指すべき手をランダムに1つ選んで返す関数
 * @param board 現在の盤面（二次元配列）
 * @returns 移動前の位置・移動後の位置・動かす駒 を含んだ1手の情報 or 指せる手がない場合は null
 */
export const getRandomComputerMove = (board: Square[][]): {
    from: [number, number]; // 駒を動かす元の座標（行, 列）
    to: [number, number];   // 駒を動かす先の座標（行, 列）
    piece: Piece;           // 実際に動かす駒の情報
} | null => {
    // すべての合法手（コンピューターが指せる手）を格納するリスト
    const allMoves: {
        from: [number, number];
        to: [number, number];
        piece: Piece;
    }[] = [];

    // 盤面の全マスを調べる
    board.forEach((row, r) =>
        row.forEach((square, c) => {
            // もしそのマスに「後手（white）の駒」があるなら
            if (square && square.owner === 'white') {
                // その駒が現在の位置 (r, c) から動ける合法な座標一覧を取得
                const moves = getMovablePositions(square, r, c, board);

                // すべての合法な移動先について、1手の情報としてallMovesに追加
                moves.forEach(([toR, toC]) => {
                    allMoves.push({
                        from: [r, c],      // 駒の現在位置
                        to: [toR, toC],    // 移動先
                        piece: square      // 駒の情報
                    });
                });
            }
        })
    );

    // 指せる手が1つもない場合は null（詰みや手詰まり）
    if (allMoves.length === 0) return null;

    // 全手の中からランダムに1手を選んで返す
    return allMoves[Math.floor(Math.random() * allMoves.length)];
};

/**
 * 駒の種類ごとに重み（価値）を設定する評価テーブル。
 * 高価な駒ほど大きなスコアを持つ。
 */
const pieceValueMap: Record<string, number> = {
    '歩': 1,
    'と': 2,
    '銀': 3,
    '成銀': 4,
    '桂': 3,
    '成桂': 4,
    '金': 5,
    '角': 6,
    '馬': 8,
    '飛': 7,
    '龍': 9,
    '玉': 0, // 玉は取れないので評価対象外
};

/**
 * 指定されたプレイヤーの「玉」の位置を探して返す。
 *
 * @param board 現在の盤面（9x9の二次元配列）
 * @param player 探したい玉の所有者（'black' または 'white'）
 * @returns 玉の位置（[行, 列]）を返す。見つからなければ null。
 */
const findKing = (board: Square[][], player: 'black' | 'white'): [number, number] | null => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === player && piece.type === '玉') {
                return [r, c];
            }
        }
    }
    return null; // 玉が見つからない（＝詰みとみなす）
};

/**
 * 指定したマスが後手（white）の攻撃範囲に入っているかを判定する。
 *
 * @param board 現在の盤面（9x9の二次元配列）
 * @param row 調べたいマスの行番号（0〜8）
 * @param col 調べたいマスの列番号（0〜8）
 * @returns 攻撃範囲内なら true、そうでなければ false。
 */
const isThreatenedByWhite = (board: Square[][], row: number, col: number): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === 'white') {
                const moves = getMovablePositions(piece, r, c, board);
                if (moves.some(([mr, mc]) => mr === row && mc === col)) {
                    return true;
                }
            }
        }
    }
    return false;
};

/**
 * 盤面が「詰み状態」（黒玉が完全に詰んでいる）かを判定する。
 *
 * @param board 現在の盤面（9x9の二次元配列）
 * @returns 黒玉が逃げ場を持たない場合 true、そうでなければ false。
 */
const isCheckmate = (board: Square[][]): boolean => {
    const kingPos = findKing(board, 'black');
    if (!kingPos) return true;

    const [r, c] = kingPos;
    const escapeMoves = getMovablePositions({ type: '玉', owner: 'black' }, r, c, board);

    // 玉の逃げ道すべてが white の攻撃範囲なら詰み
    return escapeMoves.every(([er, ec]) => isThreatenedByWhite(board, er, ec));
};

/**
 * 詰みを最優先し、次に駒の価値と安全性を考慮して、
 * 最も有利な一手を選ぶ後手（white）用AI。
 *
 * @param board 現在の盤面（9x9の二次元配列）
 * @returns 最も良いと評価された1手の情報（from, to, piece）を返す。指せる手がない場合は null。
 */
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
                const moves = getMovablePositions(square, r, c, board);

                moves.forEach(([toR, toC]) => {
                    const target = board[toR][toC];

                    // 仮想盤面に移動を反映
                    const simulatedBoard = board.map(row => [...row]);
                    simulatedBoard[toR][toC] = square;
                    simulatedBoard[r][c] = null;

                    // もしこの手で詰みになるなら即採用
                    if (isCheckmate(simulatedBoard)) {
                        bestMove = { from: [r, c], to: [toR, toC], piece: square };
                        bestScore = Infinity; // 最大スコアでロック
                        return;
                    }

                    // 評価①：取れる駒の価値
                    const captureScore =
                        target && target.owner === 'black' ? pieceValueMap[target.type] || 0 : 0;

                    // 評価②：取られにくさ（安全性）
                    const threatened = isThreatenedByBlack(simulatedBoard, toR, toC);
                    const safetyBonus = threatened ? -2 : 1;

                    // 総合スコア
                    const totalScore = captureScore + safetyBonus;

                    // スコア更新
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

/**
 * 指定したマスが先手（black）の攻撃範囲に入っているかを判定する。
 *
 * @param board 現在の盤面（9x9の二次元配列）
 * @param row 調べたいマスの行番号（0〜8）
 * @param col 調べたいマスの列番号（0〜8）
 * @returns 攻撃範囲内なら true、そうでなければ false。
 */
const isThreatenedByBlack = (board: Square[][], row: number, col: number): boolean => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const piece = board[r][c];
            if (piece && piece.owner === 'black') {
                const moves = getMovablePositions(piece, r, c, board);
                if (moves.some(([mr, mc]) => mr === row && mc === col)) {
                    return true;
                }
            }
        }
    }
    return false;
};