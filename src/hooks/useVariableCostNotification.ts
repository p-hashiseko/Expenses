import { useEffect } from 'react';
import { ExpensesRepository } from '../infrastructure/repositories/ExpensesRepository';
import {
  notifyPendingVariableCosts,
  requestNotificationPermission,
} from '../utils/notificationService';

/**
 * 変動費の未入力通知を管理するカスタムフック
 */
export const useVariableCostNotification = (
  userId: string | undefined,
  enabled: boolean = true,
) => {
  useEffect(() => {
    if (!userId || !enabled) return;

    // 初回ロード時に通知許可をリクエスト
    const initNotification = async () => {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.info('通知許可が得られていません');
        return;
      }
    };

    initNotification();

    // 定期的に未入力の変動費をチェック（1時間ごと）
    const checkInterval = setInterval(
      async () => {
        try {
          // 今月の支出を取得
          const now = new Date();
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          const expenses = await ExpensesRepository.getExpensesByPeriod(
            userId,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
          );

          // 金額が null または 0 のレコード数をカウント
          const pendingCount = expenses.filter(
            (exp) => exp.amount === null || exp.amount === 0,
          ).length;

          if (pendingCount > 0) {
            await notifyPendingVariableCosts(pendingCount);
          }
        } catch (error) {
          console.error('変動費チェックエラー:', error);
        }
      },
      60 * 60 * 1000,
    ); // 1時間ごと

    return () => clearInterval(checkInterval);
  }, [userId, enabled]);
};
