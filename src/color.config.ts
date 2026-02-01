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

  // ハイライト用の非常に薄い緑（カード背景など）
  highlightGreen: '#3ecf8e14', // 80%ではなく14(16進数)で約8%の透明度

  // 薄めのグレー（影色・ボーダー・無効色）
  lightGray: '#E5E7EB',

  // その他よく使う色
  background: '#f5f5f5',
  white: '#ffffff',
  error: '#ef4444',

  // カレンダー・日付用の色
  today: {
    header: '#fff3e0',
    cell: '#fffde7',
    text: '#e65100',
    border: '#ffb74d',
  },
  sunday: {
    header: '#ffebee',
    cell: '#fff8f8',
    text: '#c62828',
  },
  saturday: {
    header: '#e3f2fd',
    cell: '#f8fbff',
    text: '#1565c0',
  },
} as const;
