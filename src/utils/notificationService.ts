/**
 * PWA通知サービス
 * 変動費の入力を催促する通知機能を提供
 */

/**
 * 通知許可をリクエスト
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知機能をサポートしていません');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * 通知を表示
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions,
): Promise<void> => {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知機能をサポートしていません');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('通知の許可が得られていません');
    return;
  }

  // Service Worker 経由で通知を表示
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });
  } else {
    // フォールバック: 直接通知を表示
    new Notification(title, {
      icon: '/pwa-192x192.png',
      ...options,
    });
  }
};

/**
 * 変動費の未入力を通知
 */
export const notifyPendingVariableCosts = async (
  count: number,
): Promise<void> => {
  if (count === 0) return;

  await showNotification('変動費の入力が必要です', {
    body: `${count}件の変動費で金額が未入力です。\nタップして入力してください。`,
    tag: 'variable-cost-reminder',
    requireInteraction: true,
  });
};
