import type { ExpensesObjectiveConfigFront } from '../../domain/models/ExpensesObjectiveConfig';
import { supabase } from '../supabase/client';

interface ExpensesObjectiveConfigRow {
  id: string;
  user_id: string;
  paymemt_due_date: number;
  category_id: string;
  objective_amount: number | null;
  memo: string;
}

export const ExpensesObjectiveConfigRepository = {
  async getConfigs(userId: string): Promise<ExpensesObjectiveConfigFront[]> {
    const { data, error } = await supabase
      .from('expenses_objective_config')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const rows = data as ExpensesObjectiveConfigRow[];

    return rows.map((row) => ({
      tempId: crypto.randomUUID(), // 取得時にも一意識別IDを付与
      id: row.id,
      userId: row.user_id,
      day: row.paymemt_due_date,
      categoryId: row.category_id,
      amount: row.objective_amount,
      memo: row.memo || '',
    }));
  },

  async saveConfigs(userId: string, configs: ExpensesObjectiveConfigFront[]): Promise<void> {
    await supabase.from('expenses_objective_config').delete().eq('user_id', userId);

    if (configs.length === 0) return;

    const toInsert = configs.map((c) => ({
      user_id: userId,
      paymemt_due_date: c.day,
      category_id: c.categoryId,
      objective_amount: c.amount,
      memo: c.memo || '',
    }));

    const { error } = await supabase.from('expenses_objective_config').insert(toInsert);
    if (error) throw error;
  },
};
