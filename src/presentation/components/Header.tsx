import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Chip, Skeleton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';
import { APP_COLORS } from '../../color.config';
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const profile = await ProfileRepository.getProfile(user.id);
        setUsername(profile?.username || 'ゲスト');
      } catch (err) {
        console.error('Profile fetch error:', err);
        setUsername('ユーザー');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
          {loading ? (
            <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: '16px' }} />
          ) : (
            <Chip
              icon={<AccountCircle style={{ color: APP_COLORS.mainGreen }} />}
              label={username}
              variant="outlined"
              sx={{
                borderColor: APP_COLORS.lightGray,
                color: APP_COLORS.textPrimary,
                fontWeight: '600',
                px: 1,
              }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};