import {
  AccountBalanceWallet,
  ChevronLeft,
  ChevronRight,
  ShowChart,
  TableChart,
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
import { DataGrid, type GridCellParams, type GridColDef } from '@mui/x-data-grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  addMonths,
  addYears,
  endOfMonth,
  endOfYear,
  format,
  getMonth,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { ja } from 'date-fns/locale';

import React, { useEffect, useMemo, useState } from 'react';

import { APP_COLORS } from '../../../color.config';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import { ExpensesObjectiveConfigRepository } from '../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
import { useAuth } from '../../state/AuthContext';
// 外部化したグラフコンポーネント
import { AssetLineChart } from './graph/AssetLineChart';
import { CategoryPieChart } from './graph/CategoryPieChart';
import { ExpenseBarChart } from './graph/ExpenseBarChart';

export const AnalysisTab: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 資産サマリー (モック)
  const [cashAmount] = useState(450000);
  const [investmentAmount] = useState(800000);

  // データ保持
  const [assetHistoryData, setAssetHistoryData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [yearlyRows, setYearlyRows] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<{ [categoryId: string]: number }>({});

  // 全カテゴリの目標金額の合計
  const totalBudgetLimit = useMemo(() => {
    return Object.values(objectives).reduce((sum, val) => sum + val, 0);
  }, [objectives]);

  const months = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);

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
        // 1. カテゴリと目標(予算)データの取得
        const [categoryData, objectiveConfigs] = await Promise.all([
          CategoryRepository.getCategories(user.id),
          ExpensesObjectiveConfigRepository.getConfigs(user.id),
        ]);

        const catMap: { [id: string]: string } = {};
        categoryData.forEach((c: any) => {
          catMap[c.id] = c.category_name;
        });

        // 目標額をマップ化 { categoryId: amount }
        const objMap: { [id: string]: number } = {};
        objectiveConfigs.forEach((obj) => {
          if (obj.categoryId && obj.amount !== null) {
            objMap[obj.categoryId] = obj.amount;
          }
        });
        setObjectives(objMap);

        // 2. 支出データの取得
        const startOfThisYear = format(startOfYear(currentDate), 'yyyy-MM-dd');
        const endOfThisYear = format(endOfYear(currentDate), 'yyyy-MM-dd');

        const allExpenses = await ExpensesRepository.getExpensesByRange(
          user.id,
          startOfThisYear,
          endOfThisYear
        );

        // 3. 年間グリッドの集計
        const categoryMonthlySum: { [key: string]: { [month: number]: number } } = {};
        allExpenses.forEach((exp) => {
          const m = getMonth(new Date(exp.paymentDate)) + 1;
          if (!categoryMonthlySum[exp.categoryId]) {
            categoryMonthlySum[exp.categoryId] = months.reduce(
              (acc, m) => ({ ...acc, [m]: 0 }),
              {}
            );
          }
          categoryMonthlySum[exp.categoryId][m] += exp.amount;
        });

        const normalRows: any[] = [];
        let unknownRow: any = null;

        Object.entries(categoryMonthlySum).forEach(([catId, monthlyData]) => {
          const total = Object.values(monthlyData).reduce((a, b) => a + b, 0);
          const categoryName = catMap[catId];

          const row: any = { id: catId, category: categoryName || '不明なカテゴリ' };
          months.forEach((m) => (row[`month_${m}`] = monthlyData[m]));
          row.total = total;

          if (categoryName) {
            normalRows.push(row);
          } else {
            unknownRow = row;
          }
        });

        normalRows.sort((a, b) => a.category.localeCompare(b.category, 'ja'));

        const allDataRows = unknownRow ? [...normalRows, unknownRow] : normalRows;

        // 合計行の作成
        const footerRow = {
          id: 'total-footer',
          category: '合計',
          ...months.reduce((acc: any, m) => {
            acc[`month_${m}`] = allDataRows.reduce((sum, r) => sum + (r[`month_${m}`] || 0), 0);
            return acc;
          }, {}),
          total: allDataRows.reduce((sum, r) => sum + r.total, 0),
        };

        setYearlyRows([...allDataRows, footerRow]);

        // --- グラフ用データ作成 ---
        if (viewMode === 'month') {
          const start = startOfMonth(currentDate);
          const end = endOfMonth(currentDate);
          const monthExpenses = allExpenses.filter(
            (e) => new Date(e.paymentDate) >= start && new Date(e.paymentDate) <= end
          );
          const weeks = [
            { label: '1週', value: 0 },
            { label: '2週', value: 0 },
            { label: '3週', value: 0 },
            { label: '4週〜', value: 0 },
          ];
          monthExpenses.forEach((e) => {
            const d = new Date(e.paymentDate).getDate();
            if (d <= 7) weeks[0].value += e.amount;
            else if (d <= 14) weeks[1].value += e.amount;
            else if (d <= 21) weeks[2].value += e.amount;
            else weeks[3].value += e.amount;
          });
          setBarData(weeks);
        } else {
          setBarData(months.map((m) => ({ label: `${m}月`, value: footerRow[`month_${m}`] || 0 })));
        }

        const rangeStart =
          viewMode === 'month' ? startOfMonth(currentDate) : startOfYear(currentDate);
        const rangeEnd = viewMode === 'month' ? endOfMonth(currentDate) : endOfYear(currentDate);
        const filteredForPie = allExpenses.filter(
          (e) => new Date(e.paymentDate) >= rangeStart && new Date(e.paymentDate) <= rangeEnd
        );
        const pieMap: { [key: string]: number } = {};
        filteredForPie.forEach((e) => {
          const name = catMap[e.categoryId] || 'その他';
          pieMap[name] = (pieMap[name] || 0) + e.amount;
        });
        setPieData(Object.entries(pieMap).map(([label, value], id) => ({ id, value, label })));

        setAssetHistoryData([
          { month: '10月', cash: 400000, total: 700000 },
          { month: '11月', cash: 420000, total: 750000 },
          { month: '12月', cash: 440000, total: 820000 },
          { month: '1月', cash: 450000, total: 1250000 },
        ]);
      } catch (error) {
        console.error('分析データ取得失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [user, currentDate, viewMode, months]);

  const yearlyColumns: GridColDef[] = [
    { field: 'category', headerName: 'カテゴリ', width: 120 },
    ...months.map((m) => ({
      field: `month_${m}`,
      headerName: `${m}月`,
      flex: 1,
      minWidth: 80,
      align: 'right' as any,
      headerAlign: 'center' as any,
      sortable: false,
      valueFormatter: (value: any) => (!value || value === 0 ? '-' : value.toLocaleString()),
      cellClassName: (params: GridCellParams) => {
        const amount = params.value as number;

        // 合計行の超過判定
        if (params.id === 'total-footer') {
          return totalBudgetLimit > 0 && amount > totalBudgetLimit ? 'over-budget' : '';
        }

        // 通常カテゴリの超過判定
        const categoryId = params.id as string;
        const limit = objectives[categoryId];
        return limit && amount > limit ? 'over-budget' : '';
      },
    })),
    {
      field: 'total',
      headerName: '合計',
      width: 100,
      align: 'right' as any,
      headerAlign: 'center' as any,
      sortable: false,
      valueFormatter: (value: any) => (!value || value === 0 ? '-' : value.toLocaleString()),
      cellClassName: (params: GridCellParams) => {
        const amount = params.value as number;

        // 年間合計（右端列）の超過判定
        if (params.id === 'total-footer') {
          // 合計行かつ合計列の場合は、年間の総予算（総目標×12ヶ月）と比較
          return totalBudgetLimit > 0 && amount > totalBudgetLimit * 12 ? 'over-budget' : '';
        }

        const categoryId = params.id as string;
        const limit = objectives[categoryId];
        // カテゴリごとの年間合計は、そのカテゴリの目標×12ヶ月と比較
        return limit && amount > limit * 12 ? 'over-budget' : '';
      },
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  const totalAssets = cashAmount + investmentAmount;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box
        sx={{
          width: '100%',
          mt: 2,
          pb: 4,
          '& .over-budget': {
            color: `${APP_COLORS.error} !important`,
            fontWeight: 'bold',
          },
        }}
      >
        {/* A. 資産サマリー */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 3,
            bgcolor: APP_COLORS.mainGreen,
            color: 'white',
            width: '100%',
          }}
        >
          <CardContent sx={{ py: 3 }}>
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
                  sx={{ bgcolor: 'rgba(255,255,255,0.3)', height: '40px' }}
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
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold' }}>
                  合計資産
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  ¥{totalAssets.toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* B. 年間データグリッド */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 4,
            border: `1px solid ${APP_COLORS.lightGray}`,
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChart sx={{ color: APP_COLORS.mainGreen }} />
            <Typography sx={{ fontWeight: 'bold' }}>
              {format(currentDate, 'yyyy年')} カテゴリ別支出推移
            </Typography>
          </Box>
          <DataGrid
            rows={yearlyRows}
            columns={yearlyColumns}
            autoHeight
            density="compact"
            hideFooter
            disableColumnMenu
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeader': { backgroundColor: '#fafafa' },
              '& .MuiDataGrid-cell': { borderColor: APP_COLORS.lightGray },
              '& .MuiDataGrid-row[data-id="total-footer"]': {
                backgroundColor: `${APP_COLORS.mainGreen}10`,
                fontWeight: 'bold',
              },
            }}
          />
        </Card>

        {/* C. 資産推移グラフ */}
        <AssetLineChart data={assetHistoryData} />

        {/* D. 期間操作ヘッダー */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          sx={{ width: '100%' }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            <ToggleButton value="month" sx={{ px: 3, fontWeight: 'bold' }}>
              月
            </ToggleButton>
            <ToggleButton value="year" sx={{ px: 3, fontWeight: 'bold' }}>
              年
            </ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrev}>
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
                    sx: { borderRadius: 2, bgcolor: 'white', fontWeight: 'bold', width: '140px' },
                  },
                },
              }}
            />
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Stack>

        {/* E. 支出分析グラフエリア */}
        <Stack spacing={3} sx={{ width: '100%' }}>
          <ExpenseBarChart
            data={barData}
            title={`支出推移 (${viewMode === 'month' ? '週別' : '月別'})`}
          />
          <CategoryPieChart data={pieData} />
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
