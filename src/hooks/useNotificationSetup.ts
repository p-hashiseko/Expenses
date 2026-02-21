import { useEffect } from 'react';
import { useAuth } from '../presentation/state/AuthContext';

/**
 * 通知許可をリクエストして設定するカスタムフック
 * アプリ起動時に一度だけ実行される
 */
export const useNotificationSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupNotification = async () => {
      // Service Worker の準備を待つ
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;

          // 通知クリックイベントのリスナーを設定
          if (registration.active) {
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data.type === 'NOTIFICATION_CLICKED') {
                // 通知クリック時の処理（必要に応じてルーティング等）
                console.log('通知がクリックされました');
              }
            });
          }

          // 通知許可をリクエスト（初回のみ）
          if (
            'Notification' in window &&
            Notification.permission === 'default'
          ) {
            // ユーザーが初めて使う場合、説明を表示してから許可をリクエスト
            const shouldAsk = window.confirm(
              '変動費の入力忘れを通知で知らせますか？\n（後で設定から変更できます）',
            );

            if (shouldAsk) {
              await Notification.requestPermission();
            }
          }
        } catch (error) {
          console.error('通知設定エラー:', error);
        }
      }
    };

    setupNotification();
  }, [user]);
};
