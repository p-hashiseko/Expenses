/**
 * アプリケーションの共通カラー設定
 */
export const APP_COLORS = {
  // 濃い目のグレー（文字色・重要なテキスト）
  textPrimary: '#374151',

  // 明るい緑（メインカラー・ボタンなど）
  mainGreen: '#3ecf8e',

  // 暗い緑（ハイライトカラー・ホバー時など）
  darkGreen: '#2e9d6d',

  // 薄めのグレー（影色・ボーダー・無効色）
  lightGray: '#E5E7EB',

  // その他よく使う色
  background: '#f5f5f5',
  white: '#ffffff',
  error: '#ef4444',
} as const; // 読み取り専用にする