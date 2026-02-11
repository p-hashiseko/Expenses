# Project Guidelines — Expenses (家計簿 PWA)

## Architecture

3層クリーンアーキテクチャ（`src/` 配下）:

- **`domain/`** — ビジネスモデル (`XxxInput` / `XxxOutput` ペア) と定数。DB依存なし
- **`infrastructure/`** — Supabase クライアント (`client.ts`) とリポジトリ（オブジェクトリテラル `export const XxxRepository = { ... }`）。DB `snake_case` → ドメイン `camelCase` の変換はリポジトリ層で行う
- **`presentation/`** — React コンポーネント、ページ、フック、状態管理
- **`utils/`** — 汎用ユーティリティ関数

**Container/Presenter パターン**を厳守:
- **Container** (`XxxContainer.tsx`): `useAuth()` でユーザー取得、`useState`/`useEffect` で状態管理、リポジトリ呼び出し、全ロジックを集約。参考: [ExpenseEntryContainer.tsx](src/presentation/pages/dashboard/ExpenseEntryContainer/ExpenseEntryContainer.tsx)
- **Presenter** (`XxxPresenter.tsx`): `Props` 型を定義し、純粋な描画のみ。ロジックを含めない。参考: [ExpenseEntryPresenter.tsx](src/presentation/pages/dashboard/ExpenseEntryContainer/ExpenseEntryPresenter.tsx)

## Code Style

- **TypeScript strict** (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- **Prettier**: `singleQuote: true`, `trailingComma: "all"`, `printWidth: 80`, `tabWidth: 2`, `semi: true`
- **コンポーネント**: `React.FC` + 名前付きエクスポート (`export const XxxPresenter: React.FC<Props>`)。`App.tsx` のみ default export
- **スタイリング**: MUI `sx` prop のみ（外部 CSS なし）。色は `APP_COLORS`（[color.config.ts](src/color.config.ts)）から参照
- **UIテキスト・エラーメッセージ・コメント**: 日本語
- **変数名・関数名**: 英語 camelCase / 定数: UPPER_SNAKE_CASE

## Build and Test

```bash
npm run dev      # Vite 開発サーバー起動
npm run build    # tsc -b && vite build（型チェック + ビルド）
npm run lint     # eslint .
npm run preview  # vite preview
```

テストフレームワークは未導入。

## Project Conventions

- **リポジトリ**: クラスではなくオブジェクトリテラルで定義（DIなし）。エラーは `throw new Error('日本語メッセージ')` で処理。参考: [ExpensesRepository.ts](src/infrastructure/repositories/ExpensesRepository.ts)
- **ドメインモデル**: `type` で `XxxInput`（書き込み用）/ `XxxOutput`（読み取り用）をペアで定義。参考: [Expenses.ts](src/domain/models/Expenses.ts)
- **状態管理**: グローバルは `React.createContext` + `useContext`（[AuthContext.tsx](src/presentation/state/AuthContext.tsx) のみ）。コンポーネント単位は `useState`/`useEffect`。外部ライブラリ不使用
- **認証**: `AuthGuard` → `AuthContext` (`supabase.auth`) → `AuthRepository` の流れ
- **ファイル命名**: コンポーネントは PascalCase、ユーティリティは camelCase、設定は dot-separated (`color.config.ts`)
- **日付処理**: `date-fns` + `ja` ロケール。フォーマットは [formatters.ts](src/utils/formatters.ts) に集約

## Integration Points

- **Supabase**: 認証 (`supabase.auth`) + DB (`supabase.from()`) + Edge Functions (`supabase/functions/`)
- **Edge Functions**: Deno ランタイム、URL import (`deno.land/std`, `esm.sh`)、`SUPABASE_SERVICE_ROLE_KEY` 使用。参考: [create-income/index.ts](supabase/functions/create-income/index.ts)
- **MUI v7**: `@mui/material`, `@mui/x-charts`, `@mui/x-data-grid`, `@mui/x-date-pickers`
- **PWA**: `vite-plugin-pwa` で自動更新登録（[vite.config.ts](vite.config.ts)）
- **dnd-kit**: カテゴリ並べ替え等のドラッグ&ドロップ
