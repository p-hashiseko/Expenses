import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../infrastructure/supabase/client';
import type { Profile } from '../../domain/models/Profile';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository'; // インポート追加

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>; // 型定義を追加
}

// 初期値にダミーのsignOutを入れておきます
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email }
          : null,
      );
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email }
          : null,
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ★ AuthRepository を呼び出す関数を定義
  const signOut = async () => {
    await AuthRepository.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
