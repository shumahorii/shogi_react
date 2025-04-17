

// ✅ この1行は「このファイルの設定内容の型（形式）」を ts-jest から借りてくる宣言です。
// これにより、VSCodeなどのエディタで自動補完や型チェックが効くようになります。
/** @type {import('ts-jest').JestConfigWithTsJest} **/

// ✅ Jestの設定を外に公開するという意味の構文です。
// 「この設定をJestに使ってね」と伝えます。
export default {
  // ✅ Jestがテストを実行する際の実行環境を指定します。
  // テストは Node.js 上で動かすよ
  // Reactコンポーネントのテストなど、ブラウザ的な挙動を必要とする場合は "jsdom" を使います。
  testEnvironment: "node",

  // ✅ TypeScriptのファイル（.ts や .tsx）をJestで扱うために、
  // ts-jest という変換ツールを使って変換（トランスパイル）する設定です。
  // transformオプションを使うことで、「こういうファイルはどう処理するか」を指定できます。
  transform: {
    // ✅ 正規表現：.ts や .tsx のファイルはどう処理するか？
    // ✅ TypeScript のファイルを ts-jest を使って変換してテストで使う
    "^.+\\.tsx?$": ["ts-jest", {}],
    // ↑ ts-jest に空のオプション `{}` を渡しています（必要に応じて詳細設定も可能）
  },
};
