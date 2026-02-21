import { Assessment, TableChart, Settings } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import React, { Suspense, useRef, useState } from 'react';

import { APP_COLORS } from '../../color.config';
import { Header } from '../components/Header';
import type { SettingsTabHandle } from './dashboard/setting/SettingsTab';
import { useAuth } from '../state/AuthContext';
import { useVariableCostNotification } from '../../hooks/useVariableCostNotification';

// タブコンテンツを遅延ロード（バンドルサイズ削減）
const ExpenseDetailContainer = React.lazy(() =>
  import('./dashboard/ExpenseDetailPage/ExpenseDetailContainer').then(
    (module) => ({
      default: module.ExpenseDetailContainer,
    }),
  ),
);
const ExpenseAnalysisContainer = React.lazy(() =>
  import('./dashboard/ExpenseAnalysisPage/ExpenseAnalysisContainer').then(
    (module) => ({
      default: module.ExpenseAnalysisContainer,
    }),
  ),
);
const SettingsTab = React.lazy(() =>
  import('./dashboard/setting/SettingsTab').then((module) => ({
    default: module.SettingsTab,
  })),
);

// タブローディングコンポーネント
const TabLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}
  >
    <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
  </Box>
);

export type TabType = 'manage' | 'summary' | 'setting';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('manage');
  const settingsTabRef = useRef<SettingsTabHandle>(null);

  // 変動費の未入力通知を有効化
  useVariableCostNotification(user?.id, true);

  const handleUserNameClick = () => {
    setActiveTab('setting');
    // 次のレンダリング後にアカウント情報画面に遷移
    setTimeout(() => {
      settingsTabRef.current?.navigateToAccount();
    }, 0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'manage':
        return (
          <Suspense fallback={<TabLoader />}>
            <ExpenseDetailContainer />
          </Suspense>
        );
      case 'summary':
        return (
          <Suspense fallback={<TabLoader />}>
            <ExpenseAnalysisContainer />
          </Suspense>
        );
      case 'setting':
        return (
          <Suspense fallback={<TabLoader />}>
            <SettingsTab ref={settingsTabRef} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<TabLoader />}>
            <ExpenseDetailContainer />
          </Suspense>
        );
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    if (activeTab === 'setting' && newValue === 'setting') {
      settingsTabRef.current?.resetView();
    }
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: APP_COLORS.background,
      }}
    >
      <Header onUserNameClick={handleUserNameClick} />

      {/* ===== メインコンテンツ（全タブ共通 lg） ===== */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 2, sm: 3 }, // モバイルでパディング調整
          pb: { xs: 10, sm: 12 }, // BottomNavigation 分の余白
          color: APP_COLORS.textPrimary,
        }}
      >
        {renderContent()}
      </Container>

      {/* ===== Bottom Navigation ===== */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: { xs: '12px 12px 0 0', sm: '16px 16px 0 0' }, // モバイルで角丸調整
        }}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            height: { xs: 60, sm: 70 }, // モバイルで高さ調整
            '& .Mui-selected': {
              '& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root': {
                color: `${APP_COLORS.mainGreen} !important`,
                fontWeight: 'bold',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: { xs: '0.7rem', sm: '0.75rem' }, // モバイルでフォントサイズ調整
            },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1.3rem', sm: '1.5rem' }, // モバイルでアイコンサイズ調整
            },
          }}
        >
          <BottomNavigationAction
            label="管理"
            value="manage"
            icon={<TableChart />}
          />
          <BottomNavigationAction
            label="閲覧"
            value="summary"
            icon={<Assessment />}
          />
          <BottomNavigationAction
            label="設定"
            value="setting"
            icon={<Settings />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
