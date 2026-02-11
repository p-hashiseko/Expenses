import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';
import { APP_COLORS } from '../../color.config';

interface HeaderProps {
  onUserNameClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUserNameClick }) => {
  const { user } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: APP_COLORS.white,
        borderBottom: `1px solid ${APP_COLORS.lightGray}`,
        color: APP_COLORS.textPrimary,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            color: APP_COLORS.mainGreen,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          家計簿アプリ
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={<AccountCircle style={{ color: APP_COLORS.mainGreen }} />}
            label={user?.email?.split('@')[0] || 'ゲスト'}
            variant="outlined"
            onClick={onUserNameClick}
            sx={{
              borderColor: APP_COLORS.lightGray,
              color: APP_COLORS.textPrimary,
              fontWeight: '600',
              px: { xs: 0.5, sm: 1 }, // モバイルでパディング調整
              fontSize: { xs: '0.8rem', sm: '0.875rem' }, // モバイルでフォントサイズ調整
              cursor: onUserNameClick ? 'pointer' : 'default',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              height: { xs: 28, sm: 32 },
              '& .MuiChip-label': {
                px: { xs: 0.5, sm: 1 },
              },
              '& .MuiChip-icon': {
                fontSize: { xs: '1rem', sm: '1.25rem' },
              },
              '&:hover': onUserNameClick
                ? {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                : {},
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
