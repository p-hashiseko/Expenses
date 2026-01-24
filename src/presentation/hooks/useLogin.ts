import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

export const useLogin = () => {
  const navigate = useNavigate();
  
  // 入力フォームの状態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UIの表示状態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ログインボタン押下時の処理
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Infrastructure層のリポジトリを呼び出し
      await AuthRepository.signInWithUsername(username, password);
      
      // ログイン成功：ダッシュボード（ルートパス）へ遷移
      navigate('/');
    } catch (err: any) {
      // エラーハンドリング：ユーザーに表示するメッセージを設定
      setError(err.message || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin
  };
};