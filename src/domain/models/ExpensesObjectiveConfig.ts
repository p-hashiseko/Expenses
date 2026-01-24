// DBの構造と1対1で対応するモデル
export interface ExpensesObjectiveConfig {
  id?: string;
  userId: string;
  day: number;
  categoryId: string;
  amount: number | null;
  memo: string;
}

// フロントエンド専用：一意識別のための tempId を追加
export interface ExpensesObjectiveConfigFront extends ExpensesObjectiveConfig {
  tempId: string;
}
