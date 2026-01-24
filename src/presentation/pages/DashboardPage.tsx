import { Create, Flag, PieChart, Settings } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Box, Container, Paper } from '@mui/material';

import React, { useRef, useState } from 'react';

import { APP_COLORS } from '../../color.config';
import { Header } from '../components/Header';
import { AnalysisTab } from './dashboard/AnalysisTab';
import { ConfigTab } from './dashboard/ConfigTab';
import { RegistrationTab } from './dashboard/RegistrationTab';
// SettingsTabHandle を追加でインポート
import { SettingsTab, type SettingsTabHandle } from './dashboard/SettingsTab';

type TabType = 'registration' | 'analytics' | 'config' | 'setting';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('registration');

  // SettingsTab のメソッドを呼ぶための Ref を作成
  const settingsTabRef = useRef<SettingsTabHandle>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalysisTab />;
      case 'registration':
        return <RegistrationTab />;
      case 'config':
        return <ConfigTab />;
      // ref を渡すように変更
      case 'setting':
        return <SettingsTab ref={settingsTabRef} />;
      default:
        return <RegistrationTab />;
    }
  };

  // タブ変更時の処理
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    // すでに設定タブにいる状態で「設定」が押された場合、表示をリセット
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
      <Header />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          py: 3,
          pb: 10,
          color: APP_COLORS.textPrimary,
        }}
      >
        {renderContent()}
      </Container>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: '16px 16px 0 0',
        }}
        elevation={4}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleTabChange} // ハンドラを外部定義のものに変更
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              color: APP_COLORS.textPrimary,
              opacity: 0.6,
            },
            '& .Mui-selected': {
              opacity: 1,
              '& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root': {
                color: `${APP_COLORS.mainGreen} !important`,
                fontWeight: 'bold',
              },
            },
          }}
        >
          <BottomNavigationAction label="入力" value="registration" icon={<Create />} />
          <BottomNavigationAction label="分析" value="analytics" icon={<PieChart />} />
          <BottomNavigationAction label="目標" value="config" icon={<Flag />} />
          <BottomNavigationAction label="設定" value="setting" icon={<Settings />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
