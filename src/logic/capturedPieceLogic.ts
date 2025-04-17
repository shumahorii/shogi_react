
/**
 * 指定した駒を持ち駒に1つ追加するユーティリティ関数。
 * 元の Map を変更せず、新しい Map を返す（イミュータブルに動作）。
 *
 * @param map 元の持ち駒の Map（例: Map<'歩', 2>）
 * @param type 追加したい駒の種類（例: '銀'）
 * @returns 駒が1つ追加された新しい Map（例: Map<'歩', 2>, '銀', 1>）
 */
export const addCapturedPiece = (
    map: Map<string, number>,
    type: string
): Map<string, number> => {
    const updated = new Map(map); // 元のMapを複製
    updated.set(type, (updated.get(type) || 0) + 1); // 既にあるなら+1、なければ1から
    return updated;
};

/**
 * 指定した駒を持ち駒から1つ減らすユーティリティ関数。
 * 駒の数が0になった場合はMapからその駒のエントリを削除する。
 * 元の Map を変更せず、新しい Map を返す。
 *
 * @param map 元の持ち駒の Map
 * @param type 減らしたい駒の種類
 * @returns 駒が1つ減らされた新しい Map（数が0になれば削除）
 */
export const removeCapturedPiece = (
    map: Map<string, number>,
    type: string
): Map<string, number> => {
    const updated = new Map(map); // 元のMapを複製
    const currentCount = updated.get(type) || 0;

    if (currentCount <= 1) {
        updated.delete(type); // 数が1以下なら削除
    } else {
        updated.set(type, currentCount - 1); // 1つ減らす
    }

    return updated;
};

/**
 * 指定された駒が持ち駒として1つ以上存在するかどうかを判定する関数。
 *
 * @param map 持ち駒の Map
 * @param type 判定対象の駒の種類
 * @returns 1個以上存在すれば true、そうでなければ false
 */
export const hasCapturedPiece = (
    map: Map<string, number>,
    type: string
): boolean => {
    return (map.get(type) || 0) > 0;
};
