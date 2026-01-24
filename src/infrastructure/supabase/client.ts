import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SupabaseのURLまたはKeyが設定されていません。 .env.local を確認してください。');
}

// 共通で使用するsupabaseインスタンスをエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey);