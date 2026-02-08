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
    try {
      // セッションが存在する場合のみログアウトを試行
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== 'Auth session missing!') {
          throw new Error(error.message);
        }
      }

      // セッションがない場合は単にローカルストレージをクリア
      localStorage.removeItem('expenses-auth-token');
    } catch (error: any) {
      // ネットワークエラーの場合もローカルストレージをクリア
      if (
        error.message?.includes('fetch') ||
        error.message?.includes('network')
      ) {
        localStorage.removeItem('expenses-auth-token');
        return;
      }
      throw error;
    }
  },
};
