import { ArrowBack, Email, Lock, Person } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { APP_COLORS } from '../../../../../color.config';

type Props = {
  username: string;
  email: string;
  loading: boolean;
  onBack: () => void;
  onChangePassword: () => void;
};

export const AccountInfoPresenter: React.FC<Props> = ({
  username,
  email,
  loading,
  onBack,
  onChangePassword,
}) => {
  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}
        >
          アカウント情報
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {/* ユーザー名 */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${APP_COLORS.lightGray}`,
            bgcolor: APP_COLORS.white,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: APP_COLORS.textPrimary,
              opacity: 0.6,
              mb: 1,
              display: 'block',
            }}
          >
            ユーザー名
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '32px' }}>
              <CircularProgress
                size={20}
                sx={{ color: APP_COLORS.mainGreen }}
              />
            </Box>
          ) : (
            <TextField
              fullWidth
              variant="standard"
              value={username}
              InputProps={{
                readOnly: true,
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: APP_COLORS.mainGreen }} />
                  </InputAdornment>
                ),
                sx: { fontWeight: '600', color: APP_COLORS.textPrimary },
              }}
            />
          )}
        </Paper>

        {/* メールアドレス */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${APP_COLORS.lightGray}`,
            bgcolor: APP_COLORS.white,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: APP_COLORS.textPrimary,
              opacity: 0.6,
              mb: 1,
              display: 'block',
            }}
          >
            メールアドレス
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            value={email}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: APP_COLORS.mainGreen }} />
                </InputAdornment>
              ),
              sx: { fontWeight: '600', color: APP_COLORS.textPrimary },
            }}
          />
        </Paper>

        {/* パスワード（伏字のみ） */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${APP_COLORS.lightGray}`,
            bgcolor: APP_COLORS.white,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: APP_COLORS.textPrimary,
              opacity: 0.6,
              mb: 1,
              display: 'block',
            }}
          >
            パスワード
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            type="password"
            value="********"
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: APP_COLORS.mainGreen }} />
                </InputAdornment>
              ),
              sx: { fontWeight: '600', color: APP_COLORS.textPrimary },
            }}
          />
        </Paper>
      </Stack>

      {/* アクションボタン */}
      <Box sx={{ mt: 5, px: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            color: APP_COLORS.mainGreen,
            borderColor: APP_COLORS.mainGreen,
            borderRadius: 3,
            py: 1.5,
            fontWeight: 'bold',
            '&:hover': {
              borderColor: APP_COLORS.darkGreen,
              bgcolor: 'rgba(62, 207, 142, 0.04)',
            },
          }}
          onClick={onChangePassword}
        >
          パスワードを変更する
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{ color: APP_COLORS.textPrimary, opacity: 0.4 }}
        >
          アカウントの管理についてお困りの場合は
          <br />
          サポートまでお問い合わせください
        </Typography>
      </Box>
    </Box>
  );
};
