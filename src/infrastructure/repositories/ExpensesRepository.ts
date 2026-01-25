import type { Expense } from '../../domain/models/Expenses';
import { supabase } from '../supabase/client';

export const ExpensesRepository = {
  /**
   * 今日のカテゴリごとの合計支出を取得する
   */
  async getTodayTotals(userId: string, date?: string): Promise<{ [key: string]: number }> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('payment_date', targetDate);

    if (error) throw error;

    const totals: { [key: string]: number } = {};
    (data as any[]).forEach((row) => {
      totals[row.category_id] = (totals[row.category_id] || 0) + row.amount;
    });

    return totals;
  },

  /**
   * 指定された期間の支出データをすべて取得する
   */
  async getExpensesByRange(userId: string, startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase Select Error (Range):', error);
      throw error;
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amount: row.amount,
      memo: row.memo,
      paymentDate: row.payment_date,
      createdAt: row.created_at,
    }));
  },

  /**
   * 支出を保存する
   */
  async saveExpenses(expenses: Expense[]): Promise<void> {
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

  /**
   * 支出データの更新
   * @param id 更新対象の支出ID
   * @param data 更新内容（メモと金額）
   */
  async updateExpense(id: string, data: { memo: string; amount: number }): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({
        memo: data.memo,
        amount: data.amount,
        updated_at: new Date().toISOString(), // 記入時間はupdated_atで管理
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error('データの更新に失敗しました');
    }
  },

  /**
   * 支出データの削除（必要に応じて追加してください）
   */
  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error('データの削除に失敗しました');
    }
  },
};
