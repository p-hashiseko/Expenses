import { supabase } from '../supabase/client';

export const ProfileRepository = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};