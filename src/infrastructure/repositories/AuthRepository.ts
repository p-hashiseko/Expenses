import type { Profile } from '../../domain/models/Profile';
import { supabase } from '../supabase/client';

export const AuthRepository = {
  async signInWithEmail(email: string, password: string): Promise<Profile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error('メールアドレスかパスワードに誤りがあります');
    if (!data.user)
      throw new Error('メールアドレスかパスワードに誤りがあります');

    return {
      id: data.user.id,
      email: data.user.email,
    };
  },

  async signUp(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('アカウントの作成に失敗しました');
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
