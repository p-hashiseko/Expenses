import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>;
  }

  if (!user) {
    // コンポーネントを出すのではなく、URLを /login に飛ばす
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};