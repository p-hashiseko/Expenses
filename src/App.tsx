import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider } from './presentation/state/AuthContext';
import { AuthGuard } from './presentation/components/AuthGuard';
import { LoginPage } from './presentation/pages/LoginPage';
import { SignupPage } from './presentation/pages/SignupPage';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { APP_COLORS } from './color.config';

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
          </BrowserRouter>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
