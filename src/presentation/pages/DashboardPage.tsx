import {
  Assessment,
  Create,
  TableChart,
  Settings,
  AttachMoney,
} from '@mui/icons-material';
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
import {
  SettingsTab,
  type SettingsTabHandle,
} from './dashboard/setting/SettingsTab';
import { ExpenseEntryContainer } from './dashboard/ExpenseEntryContainer/ExpenseEntryContainer';
import { IncomeEntryContainer } from './dashboard/IncomeEntryPage/IncomeEntryContainer';
import { ExpenseAnalysisContainer } from './dashboard/ExpenseAnalysisPage/ExpenseAnalysisContainer';
import { ExpenseDetailContainer } from './dashboard/ExpenseDetailPage/ExpenseDetailContainer';

export type TabType =
  | 'registration'
  | 'income'
  | 'summary'
  | 'detail'
  | 'setting';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('registration');
  const settingsTabRef = useRef<SettingsTabHandle>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'registration':
        return <ExpenseEntryContainer />;
      case 'income':
        return <IncomeEntryContainer />;
      case 'summary':
        return <ExpenseAnalysisContainer />;
      case 'detail':
        return <ExpenseDetailContainer />;
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
            label="給料"
            value="income"
            icon={<AttachMoney />}
          />
          <BottomNavigationAction
            label="詳細"
            value="detail"
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
