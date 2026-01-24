import {
  AccountBalanceWallet,
  BarChart as BarChartIcon,
  ChevronLeft,
  ChevronRight,
  History,
  PieChart as PieChartIcon,
  ShowChart,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
// LineChartに変更
import { PieChart } from '@mui/x-charts/PieChart';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths, addYears, subMonths, subYears } from 'date-fns';
import { ja } from 'date-fns/locale';

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../color.config';
import { useAuth } from '../../state/AuthContext';

export const AnalysisTab: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 1. 資産の状態（全体累計）
  const [cashAmount, setCashAmount] = useState(0);
  const [investmentAmount, setInvestmentAmount] = useState(0);

  // 2. 資産推移データ（折れ線グラフ用）
  const [assetHistoryData, setAssetHistoryData] = useState<
    { month: string; cash: number; total: number }[]
  >([]);

  // 3. 期間分析データ
  const [barData, setBarData] = useState<{ label: string; value: number }[]>([]);
  const [pieData, setPieData] = useState<
    { id: number; value: number; label: string; color?: string }[]
  >([]);

  const handlePrev = () => {
    setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subYears(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addYears(currentDate, 1));
  };

  const handleModeChange = (_: any, nextMode: 'month' | 'year') => {
    if (nextMode !== null) setViewMode(nextMode);
  };

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // --- モックデータ設定 ---
        setCashAmount(450000);
        setInvestmentAmount(800000);

        // 資産推移（折れ線グラフ用）
        setAssetHistoryData([
          { month: '10月', cash: 400000, total: 700000 },
          { month: '11月', cash: 420000, total: 750000 },
          { month: '12月', cash: 440000, total: 820000 },
          { month: '1月', cash: 450000, total: 1250000 },
        ]);

        setBarData([
          { label: '1週', value: 4500 },
          { label: '2週', value: 3200 },
          { label: '3週', value: 5100 },
          { label: '4週', value: 2800 },
        ]);

        setPieData([
          { id: 0, value: 40000, label: '食費', color: APP_COLORS.mainGreen },
          { id: 1, value: 15000, label: '日用品', color: '#00C49F' },
          { id: 2, value: 8000, label: '交通費', color: '#FFBB28' },
          { id: 3, value: 12000, label: '娯楽', color: '#FF8042' },
        ]);
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [user, currentDate, viewMode]);

  const totalAssets = cashAmount + investmentAmount;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box sx={{ pb: 4 }}>
        {/* A. 資産サマリー (最上部固定) */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            mb: 3,
            bgcolor: APP_COLORS.mainGreen,
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ py: 3, px: 2 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-evenly" alignItems="center">
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.5}
                    sx={{ opacity: 0.8, mb: 0.5 }}
                  >
                    <AccountBalanceWallet sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      現金
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ¥{cashAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ bgcolor: 'rgba(255,255,255,0.3)', height: '40px', my: 'auto' }}
                />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.5}
                    sx={{ opacity: 0.8, mb: 0.5 }}
                  >
                    <ShowChart sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      投資額
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ¥{investmentAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 2 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                  合計資産
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5, letterSpacing: -1 }}>
                  ¥{totalAssets.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* B. 資産推移グラフ (折れ線グラフに修正) */}
        <Card
          elevation={0}
          sx={{ borderRadius: 4, mb: 4, border: `1px solid ${APP_COLORS.lightGray}` }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <History sx={{ color: APP_COLORS.mainGreen }} />
              <Typography sx={{ fontWeight: 'bold' }}>資産推移 (毎月1日時点)</Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 280 }}>
              <LineChart
                xAxis={[{ scaleType: 'point', data: assetHistoryData.map((d) => d.month) }]}
                series={[
                  {
                    data: assetHistoryData.map((d) => d.cash),
                    label: '現金',
                    color: '#82ca9d',
                    valueFormatter: (v) => `¥${v?.toLocaleString()}`,
                  },
                  {
                    data: assetHistoryData.map((d) => d.total),
                    label: '合計資産',
                    color: APP_COLORS.mainGreen,
                    valueFormatter: (v) => `¥${v?.toLocaleString()}`,
                  },
                ]}
                height={280}
                margin={{ top: 20, bottom: 40, left: 60, right: 20 }}
                slotProps={{
                  legend: {
                    direction: 'horizontal',
                    position: { vertical: 'bottom', horizontal: 'center' },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* C. 期間操作ヘッダー */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            <ToggleButton value="month" sx={{ px: 2, fontWeight: 'bold' }}>
              月
            </ToggleButton>
            <ToggleButton value="year" sx={{ px: 2, fontWeight: 'bold' }}>
              年
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={handlePrev} size="small">
              <ChevronLeft />
            </IconButton>
            <DatePicker
              views={viewMode === 'month' ? ['year', 'month'] : ['year']}
              open={isCalendarOpen}
              onOpen={() => setIsCalendarOpen(true)}
              onClose={() => setIsCalendarOpen(false)}
              value={currentDate}
              onChange={(val) => val && setCurrentDate(val)}
              format={viewMode === 'month' ? 'yyyy/MM' : 'yyyy'}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  onClick: () => setIsCalendarOpen(true),
                  InputProps: {
                    readOnly: true,
                    sx: {
                      borderRadius: '12px',
                      bgcolor: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      width: '120px',
                    },
                  },
                },
              }}
            />
            <IconButton onClick={handleNext} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
        </Stack>

        {/* D. 支出分析エリア */}
        <Stack spacing={3}>
          {/* 支出推移 */}
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${APP_COLORS.lightGray}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <BarChartIcon sx={{ color: APP_COLORS.mainGreen }} />
                <Typography sx={{ fontWeight: 'bold' }}>
                  支出推移 ({viewMode === 'month' ? '週別' : '月別'})
                </Typography>
              </Stack>
              <Box sx={{ width: '100%', height: 250 }}>
                <BarChart
                  series={[
                    {
                      data: barData.map((d) => d.value),
                      color: APP_COLORS.mainGreen,
                      valueFormatter: (v) => `¥${v?.toLocaleString()}`,
                    },
                  ]}
                  xAxis={[{ data: barData.map((d) => d.label), scaleType: 'band' }]}
                  height={250}
                  margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* カテゴリ割合 */}
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${APP_COLORS.lightGray}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <PieChartIcon sx={{ color: APP_COLORS.mainGreen }} />
                <Typography sx={{ fontWeight: 'bold' }}>カテゴリ別割合</Typography>
              </Stack>
              <Box sx={{ width: '100%', height: 350, display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  series={[
                    {
                      data: pieData,
                      innerRadius: 60,
                      outerRadius: 100,
                      paddingAngle: 5,
                      cornerRadius: 5,
                      valueFormatter: (item) => `¥${item.value.toLocaleString()}`,
                    },
                  ]}
                  height={350}
                  slotProps={{
                    legend: {
                      direction: 'horizontal',
                      position: { vertical: 'bottom', horizontal: 'center' },
                      sx: { p: 0 },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
