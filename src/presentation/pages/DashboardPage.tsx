import { Assessment, Create, PieChart, Settings } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Paper,
} from '@mui/material';
import React, { useRef, useState } from 'react';

import { APP_COLORS } from '../../color.config';
import { Header } from '../components/Header';
import { AnalysisTab } from './dashboard/AnalysisTab';
import {
  SettingsTab,
  type SettingsTabHandle,
} from './dashboard/setting/SettingsTab';
import { ExpenseEntryContainer } from './dashboard/ExpenseEntryContainer/ExpenseEntryContainer';
import { ExpenseAnalysisContainer } from './dashboard/ExpenseAnalysisPage/ExpenseAnalysisContainer';

export type TabType = 'registration' | 'summary' | 'analytics' | 'setting';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('registration');
  const settingsTabRef = useRef<SettingsTabHandle>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'registration':
        return <ExpenseEntryContainer />;
      case 'summary':
        return <ExpenseAnalysisContainer />;
      case 'analytics':
        return <AnalysisTab />;
      case 'setting':
        return <SettingsTab ref={settingsTabRef} />;
      default:
        return <ExpenseEntryContainer />;
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
      <Header />

      {/* ===== メインコンテンツ（全タブ共通 lg） ===== */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: 3,
          pb: 12, // BottomNavigation 分の余白
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
          borderRadius: '16px 16px 0 0',
        }}
        elevation={4}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            height: 70,
            '& .Mui-selected': {
              '& .MuiBottomNavigationAction-label, & .MuiSvgIcon-root': {
                color: `${APP_COLORS.mainGreen} !important`,
                fontWeight: 'bold',
              },
            },
          }}
        >
          <BottomNavigationAction
            label="入力"
            value="registration"
            icon={<Create />}
          />
          <BottomNavigationAction
            label="閲覧"
            value="summary"
            icon={<Assessment />}
          />
          <BottomNavigationAction
            label="分析"
            value="analytics"
            icon={<PieChart />}
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
