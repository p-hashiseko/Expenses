import type {
  CategoryConfigInput,
  CategoryConfigOutput,
} from '../../domain/models/CategoryConfig';
import { supabase } from '../supabase/client';

export const CategoryconfigRepository = {
  // カテゴリを取得
  async getCategoryConfig(userId: string): Promise<CategoryConfigOutput[]> {
    const { data, error } = await supabase
      .from('category_config')
      .select('category, sort')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  // カテゴリを登録
  async saveCategoryConfig(userId: string, categories: CategoryConfigInput[]) {
    const payload = categories.map((c) => ({ ...c, user_id: userId }));
    const { error } = await supabase.from('category_config').insert(payload);
    if (error) throw error;
  },

  // カテゴリを削除
  async deleteCategoryConfig(userId: string) {
    const { error } = await supabase
      .from('category_config')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },
};
