import type { FixedCostsConfigFront } from '../../domain/models/FixedCostsConfig';
import { supabase } from '../supabase/client';

export const FixedCostsConfigRepository = {
  /**
   * 指定したユーザーの設定を取得する
   */
  async getConfigs(userId: string): Promise<FixedCostsConfigFront[]> {
    const { data, error } = await supabase
      .from('fixed_costs_config')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data as any[]).map((row) => ({
      tempId: crypto.randomUUID(),
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amount: row.amount,
      memo: row.memo || '',
      paymentDate: row.payment_date,
    }));
  },

  /**
   * 設定を保存する（全削除 -> 全挿入）
   */
  async saveConfigs(userId: string, configs: FixedCostsConfigFront[]): Promise<void> {
    // 1. 現在のユーザーの設定をクリア
    const { error: deleteError } = await supabase
      .from('fixed_costs_config')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    if (configs.length === 0) return;

    // 2. 有効なデータのみをDB形式にマッピング
    // 固定費の場合は amount > 0、変動費の場合は amount === null のものを対象とする
    const toInsert = configs
      .filter((c) => c.amount === null || (c.amount !== null && c.amount > 0))
      .map((c) => ({
        user_id: userId,
        category_id: c.categoryId,
        amount: c.amount,
        memo: c.memo || '',
        payment_date: c.paymentDate,
      }));

    if (toInsert.length === 0) return;

    const { error: insertError } = await supabase.from('fixed_costs_config').insert(toInsert);

    if (insertError) throw insertError;
  },
};
