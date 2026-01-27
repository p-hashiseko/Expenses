import type { ExpenseInput, ExpenseOutput } from '../../domain/models/Expenses';
import { supabase } from '../supabase/client';

export const ExpensesRepository = {
  /**
   * 取得: 特定ユーザーの支出一覧を取得
   */
  async getExpenses(userId: string): Promise<ExpenseOutput[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    return (data as any[]).map((row) => ({
      userId: row.user_id,
      category: row.category,
      amount: row.amount,
      memo: row.memo,
      payment_date: row.payment_date,
    }));
  },

  /**
   * 保存 (新規作成): 単一の支出レコードを挿入
   */
  async saveExpense(expense: ExpenseInput): Promise<void> {
    const { error } = await supabase.from('expenses').insert({
      user_id: expense.userId,
      category: expense.category,
      amount: expense.amount,
      memo: expense.memo,
      payment_date: expense.payment_date,
    });

    if (error) throw error;
  },

  /**
   * 削除: 特定ユーザーの全支出データを削除
   * (特定の1件を消す場合は引数にidを追加するなどの調整が可能です)
   */
  async deleteAllExpenses(userId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * 指定した期間の支出データを取得
   */
  async getExpensesByPeriod(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ExpenseOutput[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: true });

    if (error) throw error;

    return (data as any[]).map((row) => ({
      userId: row.user_id,
      category: row.category,
      amount: row.amount,
      memo: row.memo,
      payment_date: row.payment_date,
    }));
  },
};
