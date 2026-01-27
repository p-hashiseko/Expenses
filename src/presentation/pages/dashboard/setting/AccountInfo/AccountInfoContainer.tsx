import React, { useEffect, useState } from 'react';
import { ProfileRepository } from '../../../../../infrastructure/repositories/ProfileRepository';
import { useAuth } from '../../../../state/AuthContext';
import { AccountInfoPresenter } from './AccoutnInfoPresenter';

export const AccountInfoContainer: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const profile = await ProfileRepository.getProfile(user.id);
        if (profile?.username) {
          setUsername(profile.username);
        } else {
          // ユーザー名がない場合はメールアドレスの@前を表示
          setUsername(user.email?.split('@')[0] || 'ユーザー名未設定');
        }
      } catch (error) {
        console.error('プロファイル取得失敗:', error);
        setUsername(user.email?.split('@')[0] || 'ユーザー名未設定');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
