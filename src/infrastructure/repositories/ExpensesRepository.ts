import { supabase } from '../supabase/client';

/**
 * 支出データ（expenses）に関するデータ操作を担当するリポジトリ
 */
export const ExpensesRepository = {
  /**
   * 今日のカテゴリごとの合計支出額を取得
   * RegistrationTab の左側（今日済み）の表示に使用
   */
  async getTodayTotals(userId: string): Promise<{ [categoryId: string]: number }> {
    // 1. 今日の 00:00:00 と 23:59:59.999 の ISO文字列を作成
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    // 2. expenses テーブルから今日の範囲内のデータを取得
    const { data, error } = await supabase
      .from('expenses')
      .select('category_id, amount')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) {
      console.error('getTodayTotals Error:', error);
      throw error;
    }

    // 3. カテゴリIDをキーにした合計金額オブジェクトに集計
    const totals: { [categoryId: string]: number } = {};
    data?.forEach((row) => {
      const catId = row.category_id;
      const amount = row.amount;
      
      if (!totals[catId]) {
        totals[catId] = 0;
      }
      totals[catId] += amount;
    });

    return totals;
  },

  /**
   * 複数の支出データを一括で保存（一括挿入）
   * @param expenseData 保存するデータの配列
   */
  async saveExpenses(expenseData: { user_id: string, category_id: string, amount: number }[]) {
    if (expenseData.length === 0) return;

    const { error } = await supabase
      .from('expenses')
      .insert(expenseData);

    if (error) {
      console.error('Supabase Insert Error (expenses):', error.message);
      throw error;
    }
  }
};