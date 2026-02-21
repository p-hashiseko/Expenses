import type { IncomeInput, IncomeOutput } from '../../domain/models/Income';
import { supabase } from '../supabase/client';

export const IncomeRepository = {
  /**
   * 給料レコードを挿入
   */
  async saveIncome(income: IncomeInput): Promise<void> {
    const { error } = await supabase.from('income').insert({
      user_id: income.userId,
      amount: income.amount,
      memo: income.memo,
      income_day: income.income_day,
    });

    if (error) {
      console.error('Income save error details:', error);
      throw new Error('給料の保存に失敗しました: ' + error.message);
    }
  },

  /**
   * 特定ユーザーの給料一覧を取得
   */
  async getIncomes(userId: string): Promise<IncomeOutput[]> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_day', { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      memo: row.memo,
      income_day: row.income_day,
    }));
  },

  /**
   * 特定ユーザーの給料合計を取得（income_dayがnullのレコードも含む）
   */
  async getTotalIncome(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).reduce((sum, row) => sum + (row.amount || 0), 0);
  },

  /**
   * 特定期間の給料合計を取得（income_dayがnullのレコードは含まない）
   */
  async getIncomeByPeriod(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId)
      .not('income_day', 'is', null)
      .gte('income_day', startDate)
      .lte('income_day', endDate);

    if (error) throw error;

    return (data || []).reduce((sum, row) => sum + (row.amount || 0), 0);
  },

  /**
   * 初期所持金を保存（income_dayをnullで保存）
   */
  async saveInitialBalance(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.from('income').insert({
      user_id: userId,
      amount: amount,
      memo: '初期所持金',
      income_day: null,
    });

    if (error) {
      console.error('Initial balance save error:', error);
      throw new Error('初期所持金の保存に失敗しました: ' + error.message);
    }
  },

  /**
   * 初期所持金を削除（income_dayがnullのレコードを削除）
   */
  async deleteInitialBalance(userId: string): Promise<void> {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('user_id', userId)
      .is('income_day', null);

    if (error) {
      throw new Error('初期所持金の削除に失敗しました: ' + error.message);
    }
  },

  /**
   * 指定した期間の収入データを取得
   */
  async getIncomesByPeriod(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<IncomeOutput[]> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .not('income_day', 'is', null)
      .gte('income_day', startDate)
      .lte('income_day', endDate)
      .order('income_day', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      memo: row.memo,
      income_day: row.income_day,
    }));
  },

  /**
   * 更新: 特定の収入レコードを更新
   */
  async updateIncome(
    id: number,
    amount: number,
    memo: string | null,
  ): Promise<void> {
    const { error } = await supabase
      .from('income')
      .update({
        amount,
        memo,
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * 削除: 特定の収入レコードを削除
   */
  async deleteIncome(id: number): Promise<void> {
    const { error } = await supabase.from('income').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * 初期所持金を取得（income_dayがnullのレコードの合計）
   */
  async getInitialBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId)
      .is('income_day', null);

    if (error) throw error;

    return (data || []).reduce((sum, row) => sum + (row.amount || 0), 0);
  },
};
