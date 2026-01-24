import type { IncomeConfigFront } from '../../domain/models/IncomeConfig';
import { supabase } from '../supabase/client';

export const IncomeConfigRepository = {
  /**
   * 指定したユーザーの給料設定を取得する
   */
  async getConfigs(userId: string): Promise<IncomeConfigFront[]> {
    const { data, error } = await supabase
      .from('income_config')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rows = data as IncomeConfigFront[];

    // フロントエンド用モデルに変換（一意な tempId を付与）
    return rows.map((row) => ({
      tempId: crypto.randomUUID(),
      id: row.id,
      userId: row.userId,
      income_config_day: row.income_config_day,
      amount: row.amount,
      memo: row.memo || '',
    }));
  },

  /**
   * 給料設定を保存する
   * 既存の設定を全削除してから、有効な（金額 > 0）設定のみを登録する
   */
  async saveConfigs(userId: string, configs: IncomeConfigFront[]): Promise<void> {
    // 1. 現在のユーザーの設定を一旦クリア
    const { error: deleteError } = await supabase
      .from('income_config')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // 2. 金額が入力されているもの（0より大きいもの）だけを抽出してDB形式に変換
    const toInsert = configs
      .filter((c) => c.amount > 0)
      .map((c) => ({
        user_id: userId,
        income_config_day: c.income_config_day,
        amount: c.amount,
        memo: c.memo || '',
      }));

    // 保存対象がなければ終了
    if (toInsert.length === 0) return;

    // 3. まとめてインサート
    const { error: insertError } = await supabase.from('income_config').insert(toInsert);

    if (insertError) throw insertError;
  },
};
