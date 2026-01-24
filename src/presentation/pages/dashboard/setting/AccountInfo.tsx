import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  IconButton, 
  Stack, 
  InputAdornment,
  Button
} from '@mui/material';
import { 
  ArrowBack, 
  Person, 
  Email, 
  Lock 
} from '@mui/icons-material';

import { useAuth } from '../../../state/AuthContext';
import { APP_COLORS } from '../../../../color.config';

export const AccountInfo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          アカウント情報
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {/* ユーザー名（メールの@より前を仮表示） */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${APP_COLORS.lightGray}`, bgcolor: APP_COLORS.white }}>
          <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.6, mb: 1, display: 'block' }}>
            ユーザー名
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            value={user?.email?.split('@')[0] || 'ユーザー名未設定'}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: APP_COLORS.mainGreen }} />
                </InputAdornment>
              ),
              sx: { fontWeight: '600', color: APP_COLORS.textPrimary }
            }}
          />
        </Paper>

        {/* メールアドレス */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${APP_COLORS.lightGray}`, bgcolor: APP_COLORS.white }}>
          <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.6, mb: 1, display: 'block' }}>
            メールアドレス
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            value={user?.email || ''}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: APP_COLORS.mainGreen }} />
                </InputAdornment>
              ),
              sx: { fontWeight: '600', color: APP_COLORS.textPrimary }
            }}
          />
        </Paper>

        {/* パスワード（伏字のみ） */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${APP_COLORS.lightGray}`, bgcolor: APP_COLORS.white }}>
          <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.6, mb: 1, display: 'block' }}>
            パスワード
          </Typography>
          <TextField
            fullWidth
            variant="standard"
            type="password"
            value="********" // 完全に固定の伏字
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: APP_COLORS.mainGreen }} />
                </InputAdornment>
              ),
              sx: { fontWeight: '600', color: APP_COLORS.textPrimary }
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
            }
          }}
          onClick={() => alert('パスワード再設定メールを送信する機能を今後実装予定です。')}
        >
          パスワードを変更する
        </Button>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.4 }}>
          アカウントの管理についてお困りの場合は<br/>サポートまでお問い合わせください
        </Typography>
      </Box>
    </Box>
  );
};