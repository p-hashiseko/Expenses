import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // 追加
import { AuthProvider } from './presentation/state/AuthContext';
import { AuthGuard } from './presentation/components/AuthGuard';
import { LoginPage } from './presentation/pages/LoginPage';
import { SignupPage } from './presentation/pages/SignupPage';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { APP_COLORS } from './color.config'; // 追加

// MUIのカスタムテーマ作成
const theme = createTheme({
  palette: {
    primary: {
      main: APP_COLORS.mainGreen,
      dark: APP_COLORS.darkGreen,
    },
    text: {
      primary: APP_COLORS.textPrimary,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      {' '}
      {/* 全体を包む */}
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
