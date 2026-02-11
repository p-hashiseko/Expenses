import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Vite PWAプラグインが提供する仮想モジュールをインポート
import { registerSW } from 'virtual:pwa-register';

// サービスワーカーを登録（これでインストール可能になります）
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
