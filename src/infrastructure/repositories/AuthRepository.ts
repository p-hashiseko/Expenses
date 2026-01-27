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
      throw new Error('ユーザー名が見つかりません');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('ユーザーが見つかりません');

    return { id: data.user.id, email: data.user.email };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
