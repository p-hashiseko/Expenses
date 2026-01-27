import { supabase } from '../supabase/client';
import type {
  FixedCostsConfigInput,
  FixedCostsConfigOutput,
} from '../../domain/models/FixedCostsConfig';

export const FixedCostsConfigRepository = {
  /**
   * 指定したユーザーの固定費設定を取得する
   */
  async getFixedConfig(userId: string): Promise<FixedCostsConfigOutput[]> {
    const { data, error } = await supabase
      .from('fixed_costs_config')
      .select('user_id, memo, category, amount, payment_date, sort')
      .eq('user_id', userId)
      .order('sort', { ascending: true });

    if (error) {
      throw new Error('固定費設定の取得に失敗しました: ' + error.message);
    }

    return (data || []).map((row) => ({
      userId: row.user_id,
      memo: row.memo || '',
      category: row.category,
      amount: row.amount,
      paymentDate: row.payment_date,
      sort: row.sort,
    })) as FixedCostsConfigOutput[];
  },

  /**
   * 指定したユーザーの設定を削除する
   */
  async deleteFixedConfig(userId: string): Promise<void> {
    const { error } = await supabase
      .from('fixed_costs_config')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error('固定費設定の削除に失敗しました: ' + error.message);
    }
  },

  /**
   * 指定したユーザーの設定を保存する
   */
  async saveFixedConfig(configs: FixedCostsConfigInput[]): Promise<void> {
    if (configs.length === 0) return;

    const dbItems = configs.map((c) => ({
      user_id: c.userId,
      memo: c.memo || '',
      category: c.category,
      amount: c.amount,
      payment_date: c.paymentDate,
      sort: c.sort,
    }));

    const { error } = await supabase.from('fixed_costs_config').insert(dbItems);

    if (error) {
      throw new Error('固定費設定の保存に失敗しました: ' + error.message);
    }
  },
};
