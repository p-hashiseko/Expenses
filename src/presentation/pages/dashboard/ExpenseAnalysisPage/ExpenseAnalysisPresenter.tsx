import React, { Suspense } from 'react';
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

// チャートを遅延ロード（バンドルサイズ削減）
const BarChart = React.lazy(() =>
  import('@mui/x-charts/BarChart').then((module) => ({
    default: module.BarChart,
  })),
);
const PieChart = React.lazy(() =>
  import('@mui/x-charts/PieChart').then((module) => ({
    default: module.PieChart,
  })),
);

// チャートローディングコンポーネント
const ChartLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 300,
    }}
  >
    <CircularProgress />
  </Box>
);

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
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* Header */}
        {/* 年/月切り替えトグル */}
        <Box sx={{ mb: { xs: 1, sm: 2 } }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
              },
            }}
          >
            <ToggleButton value="month">月別</ToggleButton>
            <ToggleButton value="year">年別</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Paper
          sx={{ mb: { xs: 2, sm: 4 }, borderRadius: 2 }}
          variant="outlined"
          elevation={0}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={years.indexOf(year)}
              onChange={(_, index) => setYear(years[index])}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                  minHeight: { xs: 42, sm: 48 },
                },
              }}
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
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    minHeight: { xs: 42, sm: 48 },
                  },
                }}
              >
                {months.map((m) => (
                  <Tab key={m} label={m} />
                ))}
              </Tabs>
            </Box>
          )}
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Left */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                総資産
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                mb={3}
                sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
              >
                ¥{data.totalAssets.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                現金
              </Typography>
              <Typography
                variant="h6"
                mb={2}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                ¥{data.cash.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                金融資産
              </Typography>
              <Typography
                variant="h6"
                mb={2}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                ￥{data.investment?.toLocaleString() || 0}
              </Typography>{' '}
            </Paper>
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* 期間の収支情報 */}
            <Paper
              sx={{
                mb: { xs: 1, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
              }}
              variant="outlined"
              elevation={0}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="text.primary"
                mb={2}
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {viewMode === 'month' ? `${year}年${month}月` : `${year}年`}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 3 },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    flex: { xs: '1 1 45%', sm: 'initial' },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    収入
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    ¥{data.periodIncome?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mt: { xs: 1, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  −
                </Typography>
                <Box
                  sx={{
                    textAlign: 'center',
                    flex: { xs: '1 1 45%', sm: 'initial' },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    支出
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="error.main"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    ¥{data.periodExpense?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    mt: { xs: 1, sm: 3 },
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    width: { xs: '100%', sm: 'auto' },
                    textAlign: { xs: 'center', sm: 'initial' },
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  =
                </Typography>
                <Box
                  sx={{
                    textAlign: 'center',
                    flex: { xs: '1 1 100%', sm: 'initial' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={0.5}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    収支
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    color={
                      data.periodBalance >= 0 ? 'primary.main' : 'error.main'
                    }
                  >
                    ¥{data.periodBalance?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: { xs: 1.5, sm: 3 } }}
              elevation={0}
            >
              <Grid container spacing={{ xs: 2, sm: 4 }}>
                {/* BarChart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    カテゴリ別支出額
                  </Typography>

                  <Box sx={{ width: '100%', height: { xs: 280, sm: 320 } }}>
                    <Suspense fallback={<ChartLoader />}>
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
                    </Suspense>
                  </Box>
                </Grid>

                {/* PieChart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    支出割合
                  </Typography>

                  <Box sx={{ width: '100%', height: { xs: 280, sm: 320 } }}>
                    <Suspense fallback={<ChartLoader />}>
                      <PieChart
                        width={320}
                        height={300}
                        margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        series={[
                          {
                            data: pieData.filter((item) => item.value > 0),
                            innerRadius: 50,
                            outerRadius: 85,
                            paddingAngle: 2,
                          },
                        ]}
                        slots={{
                          legend: () => null,
                        }}
                      />
                    </Suspense>
                  </Box>
                </Grid>

                {/* Monthly BarChart (年モードのみ) */}
                {viewMode === 'year' && (
                  <Grid size={12}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      月別支出推移
                    </Typography>

                    <Box sx={{ width: '100%', height: { xs: 280, sm: 300 } }}>
                      <Suspense fallback={<ChartLoader />}>
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
                      </Suspense>
                    </Box>
                  </Grid>
                )}

                {/* Table */}
                <Grid size={12}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    {viewMode === 'month'
                      ? `${year}年${month}月の詳細`
                      : `${year}年の詳細`}
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            カテゴリ
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            支出額
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            目標金額
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            割合
                          </TableCell>
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
                              <TableCell
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  px: { xs: 1, sm: 2 },
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    sx={{
                                      width: { xs: 8, sm: 10 },
                                      height: { xs: 8, sm: 10 },
                                      borderRadius: '50%',
                                      bgcolor: row.color,
                                    }}
                                  />
                                  {row.name}
                                </Box>
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  px: { xs: 1, sm: 2 },
                                }}
                              >
                                ¥{row.amount.toLocaleString()}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  px: { xs: 1, sm: 2 },
                                }}
                              >
                                {row.objective > 0
                                  ? `¥${row.objective.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  px: { xs: 1, sm: 2 },
                                }}
                              >
                                {totalExpense > 0
                                  ? `${((row.amount / totalExpense) * 100).toFixed(1)}%`
                                  : '-%'}
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
