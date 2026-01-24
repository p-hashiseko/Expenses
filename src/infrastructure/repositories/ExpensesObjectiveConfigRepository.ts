import type { ExpensesObjectiveConfigFront } from '../../domain/models/ExpensesObjectiveConfig';
import { supabase } from '../supabase/client';

export const ExpensesObjectiveConfigRepository = {
  async getConfigs(userId: string): Promise<ExpensesObjectiveConfigFront[]> {
    const { data, error } = await supabase
      .from('expenses_objective_config')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data as any[]).map((row) => ({
      tempId: crypto.randomUUID(),
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amount: row.objective_amount,
      day: row.payment_due_date,
    }));
  },

  async saveConfigs(userId: string, configs: ExpensesObjectiveConfigFront[]): Promise<void> {
    // 全削除してから有効なもの（金額が設定されているもの）を保存
    await supabase.from('expenses_objective_config').delete().eq('user_id', userId);

    const toInsert = configs
      .filter((c) => c.amount !== null && c.amount > 0)
      .map((c) => ({
        user_id: userId,
        category_id: c.categoryId,
        objective_amount: c.amount,
        payment_due_date: c.day,
      }));

    if (toInsert.length === 0) return;

    const { error } = await supabase.from('expenses_objective_config').insert(toInsert);
    if (error) throw error;
  },
};
