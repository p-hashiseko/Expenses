import type { Profile } from '../../domain/models/Profile';
import { supabase } from '../supabase/client';

export const AuthRepository = {
  // --- 既存の signInWithUsername はそのまま ---
  async signInWithUsername(
    username: string,
    password: string,
  ): Promise<Profile> {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      throw new Error('ユーザー名かパスワードに誤りがあります');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    });

    if (error) throw new Error('ユーザー名かパスワードに誤りがあります');
    if (!data.user) throw new Error('ユーザー名かパスワードに誤りがあります');

    return { id: data.user.id, email: data.user.email };
  },

  async signUp(
    username: string,
    email: string,
    password: string,
  ): Promise<void> {
    // ユーザー名の重複チェック
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('このユーザー名は既に使用されています');
    }

    // Supabase Authでユーザー作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('アカウントの作成に失敗しました');

    // profilesテーブルにユーザー名を登録
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: data.user.id,
        username,
        email,
      },
    ]);

    if (profileError) {
      throw new Error('プロフィールの作成に失敗しました');
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
