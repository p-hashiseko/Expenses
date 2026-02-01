import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

interface PresenterProps {
  year: number;
  month: number;
  viewMode: 'month' | 'year';
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
  setViewMode: (mode: 'month' | 'year') => void;
  years: number[];
  months: string[];
  data: any;
  loading: boolean;
  totalExpense: number;
  barSeriesData: number[];
  barObjectiveData: number[];
  categoryLabels: string[];
  pieData: any[];
  monthlyData: number[];
}

export const ExpenseAnalysisPresenter: React.FC<PresenterProps> = ({
  year,
  month,
  viewMode,
  setYear,
  setMonth,
  setViewMode,
  years,
  months,
  data,
  loading,
  totalExpense,
  barSeriesData,
  barObjectiveData,
  categoryLabels,
  pieData,
  monthlyData,
}) => {
  if (!data && loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const maxExpense = Math.max(...barSeriesData, ...barObjectiveData, 0);

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* Header */}
        {/* 年/月切り替えトグル */}
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="month">月別</ToggleButton>
            <ToggleButton value="year">年別</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Paper sx={{ mb: 4, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={years.indexOf(year)}
              onChange={(_, index) => setYear(years[index])}
              variant="scrollable"
              scrollButtons="auto"
            >
              {years.map((y) => (
                <Tab key={y} label={`${y}年`} />
              ))}
            </Tabs>
          </Box>
          {viewMode === 'month' && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={month - 1}
                onChange={(_, val) => setMonth(val + 1)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {months.map((m) => (
                  <Tab key={m} label={m} />
                ))}
              </Tabs>
            </Box>
          )}
        </Paper>

        <Grid container spacing={3}>
          {/* Left */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                総資産
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={4}>
                ¥{data.totalAssets.toLocaleString()}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                現金
              </Typography>
              <Typography variant="h6">
                ¥{data.cash.toLocaleString()}
              </Typography>

              <Typography mt={2} variant="caption" color="text.secondary">
                金融資産
              </Typography>
              <Typography variant="h6">
                ¥{data.investment.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* 期間の収支情報 */}
            <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                mb={2}
              >
                {viewMode === 'month' ? `${year}年${month}月` : `${year}年`}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    収入
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    ¥{data.periodIncome?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mt: 3 }}>
                  −
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    支出
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    ¥{data.periodExpense?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mt: 3 }}>
                  =
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    収支
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={
                      data.periodBalance >= 0 ? 'primary.main' : 'error.main'
                    }
                  >
                    ¥{data.periodBalance?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={4}>
                {/* BarChart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    カテゴリ別支出額
                  </Typography>

                  <Box sx={{ width: '100%', height: 320 }}>
                    <BarChart
                      layout="horizontal"
                      height={300}
                      yAxis={[
                        {
                          scaleType: 'band',
                          data: categoryLabels,
                          width: 100,
                        },
                      ]}
                      xAxis={[
                        {
                          min: 0,
                          max: maxExpense * 1.2,
                        },
                      ]}
                      series={[
                        {
                          data: barSeriesData,
                          label: '実績',
                          color: '#3ecf8e',
                        },
                        {
                          data: barObjectiveData,
                          label: '目標',
                          color: '#E5E7EB',
                        },
                      ]}
                    />
                  </Box>
                </Grid>

                {/* PieChart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    支出割合
                  </Typography>

                  <Box sx={{ width: '100%', height: 320 }}>
                    <PieChart
                      width={320}
                      height={320}
                      margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      series={[
                        {
                          data: pieData.filter((item) => item.value > 0),
                          innerRadius: 60,
                          outerRadius: 90,
                          paddingAngle: 2,
                        },
                      ]}
                      slots={{
                        legend: () => null,
                      }}
                    />
                  </Box>
                </Grid>

                {/* Monthly BarChart (年モードのみ) */}
                {viewMode === 'year' && (
                  <Grid size={12}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                    >
                      月別支出推移
                    </Typography>

                    <Box sx={{ width: '100%', height: 300 }}>
                      <BarChart
                        height={280}
                        xAxis={[
                          {
                            scaleType: 'band',
                            data: [
                              '1月',
                              '2月',
                              '3月',
                              '4月',
                              '5月',
                              '6月',
                              '7月',
                              '8月',
                              '9月',
                              '10月',
                              '11月',
                              '12月',
                            ],
                          },
                        ]}
                        series={[
                          {
                            data: monthlyData,
                            label: '支出',
                            color: '#3ecf8e',
                          },
                        ]}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Table */}
                <Grid size={12}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {viewMode === 'month'
                      ? `${year}年${month}月の詳細`
                      : `${year}年の詳細`}
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>カテゴリ</TableCell>
                          <TableCell align="right">支出額</TableCell>
                          <TableCell align="right">目標金額</TableCell>
                          <TableCell align="right">割合</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.categories.map((row: any) => {
                          const isUnderBudget =
                            row.objective > 0 && row.amount > row.objective;
                          return (
                            <TableRow
                              key={row.name}
                              sx={{
                                bgcolor: isUnderBudget
                                  ? 'rgba(62, 207, 142, 0.1)'
                                  : 'inherit',
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%',
                                      bgcolor: row.color,
                                    }}
                                  />
                                  {row.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                ¥{row.amount.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                {row.objective > 0
                                  ? `¥${row.objective.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell align="right">
                                {((row.amount / totalExpense) * 100).toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
