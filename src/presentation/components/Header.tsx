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
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            color: APP_COLORS.mainGreen,
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
              px: 1,
              cursor: onUserNameClick ? 'pointer' : 'default',
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
