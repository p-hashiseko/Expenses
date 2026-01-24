import type { Expense } from '../../domain/models/Expenses';
import { supabase } from '../supabase/client';

export const ExpensesRepository = {
  /**
   * 今日のカテゴリごとの合計支出を取得する
   */
  async getTodayTotals(userId: string): Promise<{ [key: string]: number }> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('payment_date', today);

    if (error) throw error;

    const totals: { [key: string]: number } = {};
    (data as any[]).forEach((row) => {
      totals[row.category_id] = (totals[row.category_id] || 0) + row.amount;
    });

    return totals;
  },

  /**
   * 支出を保存する
   */
  async saveExpenses(expenses: Expense[]): Promise<void> {
    // Expenseモデル（キャメルケース）からDBカラム名（スネークケース）へマッピング
    const toInsert = expenses.map((e) => ({
      user_id: e.userId,
      category_id: e.categoryId,
      amount: e.amount,
      memo: e.memo,
      payment_date: e.paymentDate,
    }));

    const { error } = await supabase.from('expenses').insert(toInsert);

    if (error) {
      console.error('Supabase Insert Error:', error);
      throw error;
    }
  },
};
