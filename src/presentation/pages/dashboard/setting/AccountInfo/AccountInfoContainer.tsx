import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../state/AuthContext';
import { AccountInfoPresenter } from './AccoutnInfoPresenter';

export const AccountInfoContainer: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setUsername(user.email?.split('@')[0] || 'ユーザー名未設定');
    setLoading(false);
  }, [user]);

  const handleChangePassword = () => {
    alert('パスワード再設定メールを送信する機能を今後実装予定です。');
  };

  return (
    <AccountInfoPresenter
      username={username}
      email={user?.email || ''}
      loading={loading}
      onBack={onBack}
      onChangePassword={handleChangePassword}
    />
  );
};
