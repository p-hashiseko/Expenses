import {
  Category,
  ChevronRight,
  Logout,
  Payments, // 給料用のアイコンを追加
  Person,
  Receipt,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

import { forwardRef, useImperativeHandle, useState } from 'react';

// プロジェクト固有のインポート
import { APP_COLORS } from '../../../color.config';
import { useAuth } from '../../state/AuthContext';
import { AccountInfo } from './setting/AccountInfo';
import { CategoriesSetting } from './setting/CategoriesSetting';
import { FixedCostSetting } from './setting/FixedCostSetting';
import { SalarySetting } from './setting/SlarySetting';

// 今後作成する画面

// 親コンポーネントから呼び出すための型定義
export interface SettingsTabHandle {
  resetView: () => void;
}

export const SettingsTab = forwardRef<SettingsTabHandle, {}>((_props, ref) => {
  const { signOut } = useAuth();

  // 表示する画面を管理するステート（'salary' を追加）
  const [currentView, setCurrentView] = useState<
    'menu' | 'categories' | 'account' | 'fixed' | 'salary'
  >('menu');

  // 親コンポーネント（DashboardPage等）からアクセス可能にする関数
  useImperativeHandle(ref, () => ({
    resetView: () => {
      setCurrentView('menu');
    },
  }));

  const handleLogout = async () => {
    if (window.confirm('ログアウトしてもよろしいですか？')) {
      try {
        await signOut();
      } catch (error: any) {
        alert('ログアウトに失敗しました: ' + error.message);
      }
    }
  };

  // --- 画面切り替え条件分岐 ---
  if (currentView === 'categories') {
    return <CategoriesSetting onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'account') {
    return <AccountInfo onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'fixed') {
    return <FixedCostSetting onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'salary') {
    return <SalarySetting onBack={() => setCurrentView('menu')} />;
  }

  // --- メインメニュー (currentView === 'menu') ---
  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100%' }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          pl: 1,
          fontWeight: 'bold',
          color: APP_COLORS.textPrimary,
        }}
      >
        設定
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${APP_COLORS.lightGray}`,
          overflow: 'hidden',
          bgcolor: APP_COLORS.white,
        }}
      >
        <List disablePadding>
          {/* アカウント情報 */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setCurrentView('account')}>
              <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="アカウント情報"
                primaryTypographyProps={{ fontWeight: '600', color: APP_COLORS.textPrimary }}
              />
              <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: APP_COLORS.lightGray }} />

          {/* カテゴリ設定 */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setCurrentView('categories')}>
              <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
                <Category />
              </ListItemIcon>
              <ListItemText
                primary="カテゴリ設定"
                primaryTypographyProps={{ fontWeight: '600', color: APP_COLORS.textPrimary }}
              />
              <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: APP_COLORS.lightGray }} />

          {/* 固定費の設定 */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setCurrentView('fixed')}>
              <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
                <Receipt />
              </ListItemIcon>
              <ListItemText
                primary="固定費の設定"
                primaryTypographyProps={{ fontWeight: '600', color: APP_COLORS.textPrimary }}
              />
              <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: APP_COLORS.lightGray }} />

          {/* 給料の設定 */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setCurrentView('salary')}>
              <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
                <Payments />
              </ListItemIcon>
              <ListItemText
                primary="給料の設定"
                primaryTypographyProps={{ fontWeight: '600', color: APP_COLORS.textPrimary }}
              />
              <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: APP_COLORS.lightGray }} />

          {/* ログアウト */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}
            >
              <ListItemIcon sx={{ color: APP_COLORS.error }}>
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary="ログアウト"
                primaryTypographyProps={{ fontWeight: '600', color: APP_COLORS.error }}
              />
              <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.5 }}>
          家計簿アプリ Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
});

SettingsTab.displayName = 'SettingsTab';
