import type { Category } from '../../domain/models/Category';
import { supabase } from '../supabase/client';

export const CategoryRepository = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id,user_id, category_name, is_not_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // 編集・新規登録を一括で行う (idがあれば更新、なければ新規)
  async saveCategories(categories: any[]) {
    const { error } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' });
    if (error) throw error;
  },

  // 削除
  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async deleteAllAndInsert(userId: string, categories: any[]) {
  // 1. 削除
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('user_id', userId);
  
  if (deleteError) throw deleteError;

  // 2. 挿入
  if (categories.length > 0) {
    const { error: insertError } = await supabase
      .from('categories')
      .insert(categories);
    
    if (insertError) throw insertError;
  }
},

async saveCategoriesOrdered(userId: string, categories: any[]) {
  // 1. 画面に存在しない（＝ユーザーが消した、あるいは空欄にした）IDを特定して削除
  const activeIds = categories.filter(c => c.id).map(c => c.id);
  
  if (activeIds.length > 0) {
    // Supabase expects string values in the `in` list to be quoted, e.g. ("id1","id2")
    const inList = `(${activeIds.map((id: string) => `'${id}'`).join(',')})`;
    await supabase
      .from('categories')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', inList);
  } else {
    // 画面にID付きのデータが一つもない場合は全削除
    await supabase.from('categories').delete().eq('user_id', userId);
  }

  // 2. アップサート（IDがあれば更新、なければ新規挿入）
  const { error } = await supabase.from('categories').upsert(categories);

  if (error) throw error;
}
};

