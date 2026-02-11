import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { APP_COLORS } from '../../color.config';
import { useLogin } from '../hooks/useLogin';

const REMEMBER_USERNAME_KEY = 'rememberedUsername';

export const LoginPage: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  } = useLogin();

  const [rememberMe, setRememberMe] = React.useState(false);

  // ページ読み込み時、保存されたユーザー名があれば復元
  useEffect(() => {
    const savedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, [setUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ログイン実行
    await handleLogin(e);

    // ログイン成功後、チェックボックスの状態に応じてユーザー名を保存/削除
    if (rememberMe) {
      localStorage.setItem(REMEMBER_USERNAME_KEY, username);
    } else {
      localStorage.removeItem(REMEMBER_USERNAME_KEY);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          mx: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          fontWeight="bold"
          mb={3}
          textAlign="center"
          color={APP_COLORS.mainGreen}
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          ログイン
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="メールアドレス"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          />

          <TextField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                sx={{
                  color: APP_COLORS.mainGreen,
                  '&.Mui-checked': {
                    color: APP_COLORS.mainGreen,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                メールアドレスを記憶する
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 2,
              bgcolor: APP_COLORS.mainGreen,
              color: 'white',
              py: { xs: 1.2, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                bgcolor: APP_COLORS.darkGreen,
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'ログイン'
            )}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              アカウントをお持ちでない方は{' '}
              <Link
                to="/signup"
                style={{
                  color: APP_COLORS.mainGreen,
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                こちら
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
