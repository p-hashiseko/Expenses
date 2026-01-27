import type {
  ExpensesObjectiveConfigInput,
  ExpensesObjectiveConfigOutput,
} from '../../domain/models/ExpensesObjectiveConfig';
import { supabase } from '../supabase/client';

export const ExpensesObjectiveConfigRepository = {
  /**
   * 取得: DBのスネークケースをOutput型にマッピング
   */
  async getConfigs(userId: string): Promise<ExpensesObjectiveConfigOutput[]> {
    const { data, error } = await supabase
      .from('expenses_objective_config')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data as any[]).map((row) => ({
      category: row.category,
      objective_amount: row.objective_amount,
      payment_due_date: row.payment_due_date,
    }));
  },

  /**
   * 削除: 指定ユーザーの設定をクリア
   */
  async deleteConfigs(userId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses_objective_config')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * 保存: Input型をDBのカラム名(スネークケース)にマッピングして挿入
   */
  async saveConfigs(configs: ExpensesObjectiveConfigInput[]): Promise<void> {
    const toInsert = configs.map((c) => ({
      user_id: c.userId,
      category: c.category,
      objective_amount: c.objective_amount,
      payment_due_date: c.payment_due_date,
    }));

    const { error } = await supabase
      .from('expenses_objective_config')
      .insert(toInsert);

    if (error) throw error;
  },
};
