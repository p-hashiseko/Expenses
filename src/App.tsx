import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthProvider } from './presentation/state/AuthContext';
import { AuthGuard } from './presentation/components/AuthGuard';
import { APP_COLORS } from './color.config';
import { useNotificationSetup } from './hooks/useNotificationSetup';

// ページコンポーネントを遅延ロード（バンドルサイズ削減）
const LoginPage = React.lazy(() =>
  import('./presentation/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
);
const SignupPage = React.lazy(() =>
  import('./presentation/pages/SignupPage').then((module) => ({
    default: module.SignupPage,
  })),
);
const DashboardPage = React.lazy(() =>
  import('./presentation/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

// ローディングコンポーネント
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: APP_COLORS.background,
    }}
  >
    <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
  </Box>
);

// MUIのカスタムテーマ作成
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600, // モバイル/PC の境界を600pxに設定
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: APP_COLORS.mainGreen,
      dark: APP_COLORS.darkGreen,
    },
    text: {
      primary: APP_COLORS.textPrimary,
    },
    background: {
      default: '#f8f9fa',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          // PC・スマホ両方で違和感のないパディングに調整
          padding: '8px 16px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        // モバイルでテキスト選択を防ぐ（PC版は影響なし）
        '@media (max-width: 600px)': {
          '*': {
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          },
          // 入力フィールドは選択可能にする
          'input, textarea': {
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text',
          },
        },
      },
    },
  },
});

function App() {
  // 通知機能の初期化
  useNotificationSetup();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {/* maxWidth を '500px' から 'none' (または削除) に変更しました。
          これでPCでは画面いっぱいに広がります。
        */}
        <Box
          sx={{
            width: '100%',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <DashboardPage />
                    </AuthGuard>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
