import { supabase } from "../supabase/client";

export const ExpensesObjectiveConfigRepository = {
  // 設定の取得
  async getConfigs(userId: string) {
    const { data, error } = await supabase
      .from('expenses_objective_config')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // 設定の一括保存（削除＆再挿入スタイル）
  async saveConfigs(userId: string, configs: any[]) {
    // 1. 一旦全削除（シンプルにするため）
    await supabase.from('expenses_objective_config').delete().eq('user_id', userId);
    
    // 2. 挿入
    if (configs.length === 0) return;
    const toInsert = configs.map(c => ({
      user_id: userId,
      day: c.day,
      category_id: c.category_id,
      amount: c.amount,
      is_fixed: c.is_fixed
    }));
    
    const { error } = await supabase.from('expenses_objective_config').insert(toInsert);
    if (error) throw error;
  }
};