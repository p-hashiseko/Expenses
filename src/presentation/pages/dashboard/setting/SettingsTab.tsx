import {
  AccountBalance,
  Category,
  ChevronRight,
  Logout,
  Payments,
  Person,
  Receipt,
  TrackChanges,
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
import React, { forwardRef, useImperativeHandle, useState } from 'react';

// プロジェクト固有のインポート
import { APP_COLORS } from '../../../../color.config';
import { useAuth } from '../../../state/AuthContext';
import { CategorySettingContainer } from './CategorySetting/CategorySettingContainer';
import { SalarySettingContainer } from './SlarySetting/SlarySettingContainer';
import { FixedCostSettingContainer } from './FixedCostSetting/FixedCostSettingContainer';
import { AccountInfoContainer } from './AccountInfo/AccountInfoContainer';
import { ObjectiveSettingContainer } from './ObjectiveSetting/ObjectiveSettingContainer';
import { InitialBalanceSettingContainer } from './InitialBalanceSetting/InitialBalanceSettingContainer';

// --- 型定義 ---
export interface SettingsTabHandle {
  resetView: () => void;
}

type ViewType =
  | 'menu'
  | 'categories'
  | 'account'
  | 'fixed'
  | 'salary'
  | 'objective'
  | 'initialBalance';

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

// --- メインコンポーネント ---
export const SettingsTab = forwardRef<SettingsTabHandle, {}>((_props, ref) => {
  const { signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('menu');

  useImperativeHandle(ref, () => ({
    resetView: () => setCurrentView('menu'),
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

  // --- メニュー項目の定義 ---
  const configItems: MenuItem[] = [
    { id: 'categories', label: 'カテゴリの設定', icon: <Category /> },
    { id: 'salary', label: '給料の設定', icon: <Payments /> },
    { id: 'fixed', label: '固定費・変動費の設定', icon: <Receipt /> },
    { id: 'objective', label: '目標の設定', icon: <TrackChanges /> },
    {
      id: 'initialBalance',
      label: '初期所持金の設定',
      icon: <AccountBalance />,
    },
  ];

  // --- 表示切り替えロジック ---
  const renderSubView = () => {
    switch (currentView) {
      case 'categories':
        return (
          <CategorySettingContainer onBack={() => setCurrentView('menu')} />
        );
      case 'account':
        return <AccountInfoContainer onBack={() => setCurrentView('menu')} />;
      case 'fixed':
        return (
          <FixedCostSettingContainer onBack={() => setCurrentView('menu')} />
        );
      case 'salary':
        return <SalarySettingContainer onBack={() => setCurrentView('menu')} />;
      case 'objective':
        return (
          <ObjectiveSettingContainer onBack={() => setCurrentView('menu')} />
        );
      case 'initialBalance':
        return (
          <InitialBalanceSettingContainer
            onBack={() => setCurrentView('menu')}
          />
        );
      default:
        return null;
    }
  };

  if (currentView !== 'menu') {
    return renderSubView();
  }

  // --- 共通コンポーネント: セクションタイトル ---
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        mb: 1,
        pl: 1,
        fontWeight: 'bold',
        color: APP_COLORS.textPrimary,
        opacity: 0.7,
      }}
    >
      {children}
    </Typography>
  );

  // --- 共通コンポーネント: メニューリスト容器 ---
  const MenuPaper = ({ children }: { children: React.ReactNode }) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${APP_COLORS.lightGray}`,
        overflow: 'hidden',
        bgcolor: APP_COLORS.white,
        mb: 3,
      }}
    >
      <List disablePadding>{children}</List>
    </Paper>
  );

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100%' }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, pl: 1, fontWeight: 'bold', color: APP_COLORS.textPrimary }}
      >
        設定
      </Typography>

      <SectionTitle>家計簿の設定</SectionTitle>
      <MenuPaper>
        {configItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentView(item.id)}>
                <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: '600',
                    color: APP_COLORS.textPrimary,
                  }}
                />
                <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
              </ListItemButton>
            </ListItem>
            {index < configItems.length - 1 && (
              <Divider sx={{ borderColor: APP_COLORS.lightGray }} />
            )}
          </React.Fragment>
        ))}
      </MenuPaper>

      <SectionTitle>アカウント</SectionTitle>
      <MenuPaper>
        {/* アカウント情報 */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setCurrentView('account')}>
            <ListItemIcon sx={{ color: APP_COLORS.mainGreen }}>
              <Person />
            </ListItemIcon>
            <ListItemText
              primary="アカウント情報"
              primaryTypographyProps={{
                fontWeight: '600',
                color: APP_COLORS.textPrimary,
              }}
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
              primaryTypographyProps={{
                fontWeight: '600',
                color: APP_COLORS.error,
              }}
            />
            <ChevronRight sx={{ color: APP_COLORS.lightGray }} />
          </ListItemButton>
        </ListItem>
      </MenuPaper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{ color: APP_COLORS.textPrimary, opacity: 0.5 }}
        >
          家計簿アプリ Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
});

SettingsTab.displayName = 'SettingsTab';
