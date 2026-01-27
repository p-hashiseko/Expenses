import type {
  IncomeConfigInput,
  IncomeConfigOutput,
} from '../../domain/models/IncomeConfig';
import { supabase } from '../supabase/client';

export const IncomeConfigRepository = {
  /**
   * 指定したユーザーの給料設定を取得する
   */
  async getIncomeConfig(userId: string): Promise<IncomeConfigOutput[]> {
    const { data, error } = await supabase
      .from('income_config')
      .select('user_id, income_config_day, memo, amount, sort')
      .eq('user_id', userId);

    if (error) {
      throw new Error('給料設定の取得に失敗しました: ' + error.message);
    }

    return (data || []).map((d: any) => ({
      userId: d.user_id,
      income_config_day: d.income_config_day,
      memo: d.memo,
      amount: d.amount,
      sort: d.sort,
    })) as IncomeConfigOutput[];
  },

  /**
   * 指定したユーザーの給料設定を削除する
   */
  async deleteIncomeConfig(userId: string): Promise<void> {
    const { error } = await supabase
      .from('income_config')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error('給料設定の削除に失敗しました: ' + error.message);
    }
  },

  /**
   * 指定したユーザーの給料設定を設定する
   */
  async saveIncomeCongigInput(
    incomeConfigInput: IncomeConfigInput[],
  ): Promise<void> {
    const dbItems = incomeConfigInput.map((item) => ({
      user_id: item.userId,
      income_config_day: item.income_config_day,
      memo: item.memo,
      amount: item.amount,
      sort: item.sort,
    }));

    const { error } = await supabase.from('income_config').insert(dbItems);

    if (error) {
      throw new Error('給料設定の保存に失敗しました: ' + error.message);
    }
  },
};
