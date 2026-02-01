import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { APP_COLORS } from '../../../../color.config';
import { CATEGORY } from '../../../../domain/const/Category';
import { formatCurrency } from '../../../../utils/formatters';
import { format, parseISO, isWeekend, isSunday } from 'date-fns';
import { ja } from 'date-fns/locale';

type Props = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  dates: string[];
  categories: any[];
  expenses: any[];
  todayStr: string;
  loading: boolean;
  selectedYear: number;
  selectedMonth: number;
  years: number[];
  months: number[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
};

const formatDayCell = (dateStr: string) => {
  const date = parseISO(dateStr);
  const day = format(date, 'd');
  const weekday = format(date, 'E', { locale: ja });
  return { day, weekday };
};

export const ExpenseDetailPresenter: React.FC<Props> = (props) => {
  if (props.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // カテゴリ別の月間合計を計算
  const getCategoryTotal = (category: string) => {
    return props.expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 日別合計を計算
  const getDayTotal = (date: string) => {
    return props.expenses
      .filter((e) => e.payment_date === date)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // 月間総合計
  const monthlyTotal = props.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー: 年月選択 */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={props.years.indexOf(props.selectedYear)}
            onChange={(_, index) => props.onYearChange(props.years[index])}
            variant="scrollable"
            scrollButtons="auto"
          >
            {props.years.map((y) => (
              <Tab key={y} label={`${y}年`} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={props.selectedMonth - 1}
            onChange={(_, val) => props.onMonthChange(val + 1)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {props.months.map((m) => (
              <Tab key={m} label={`${m}月`} />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* 月間合計表示 */}
      <Paper sx={{ mb: 2, p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" color={APP_COLORS.mainGreen}>
          {props.selectedYear}年{props.selectedMonth}月の合計：
          <Box component="span" sx={{ ml: 1 }}>
            {formatCurrency(monthlyTotal)} 円
          </Box>
        </Typography>
      </Paper>

      {/* メイングリッド */}
      <TableContainer
        ref={props.tableContainerRef}
        component={Paper}
        sx={{
          borderRadius: 2,
          overflowX: 'auto',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {/* カテゴリ列ヘッダー */}
              <TableCell
                sx={{
                  bgcolor: APP_COLORS.lightGray,
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 0,
                  zIndex: 20,
                  minWidth: 100,
                  borderRight: `2px solid ${APP_COLORS.background}`,
                }}
              >
                カテゴリ
              </TableCell>

              {/* 合計列ヘッダー */}
              <TableCell
                align="center"
                sx={{
                  bgcolor: APP_COLORS.mainGreen,
                  color: 'white',
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 100,
                  zIndex: 20,
                  minWidth: 80,
                  borderRight: `2px solid ${APP_COLORS.background}`,
                }}
              >
                合計
              </TableCell>

              {/* 日付ヘッダー */}
              {props.dates.map((date) => {
                const { day, weekday } = formatDayCell(date);
                const isToday = date === props.todayStr;
                const dateObj = parseISO(date);
                const isSun = isSunday(dateObj);
                const isSat = isWeekend(dateObj) && !isSun;

                return (
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      bgcolor: isToday
                        ? APP_COLORS.today.header
                        : isSun
                          ? APP_COLORS.sunday.header
                          : isSat
                            ? APP_COLORS.saturday.header
                            : APP_COLORS.lightGray,
                      color: isToday
                        ? APP_COLORS.today.text
                        : isSun
                          ? APP_COLORS.sunday.text
                          : isSat
                            ? APP_COLORS.saturday.text
                            : 'inherit',
                      minWidth: 50,
                      fontWeight: isToday ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                      borderBottom: isToday
                        ? `2px solid ${APP_COLORS.today.border}`
                        : 'none',
                      px: 0.5,
                    }}
                  >
                    <Box sx={{ fontSize: '0.75rem' }}>{day}</Box>
                    <Box sx={{ fontSize: '0.6rem' }}>{weekday}</Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.categories.map((cat) => {
              const categoryTotal = getCategoryTotal(cat.category);

              return (
                <TableRow key={cat.category} hover>
                  {/* カテゴリ名 */}
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: '#f8f8f8',
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      borderRight: `2px solid ${APP_COLORS.background}`,
                      boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {CATEGORY[cat.category] || cat.category}
                  </TableCell>

                  {/* カテゴリ別合計 */}
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: '#f1f8f1',
                      position: 'sticky',
                      left: 100,
                      zIndex: 10,
                      borderRight: `2px solid ${APP_COLORS.background}`,
                      boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {categoryTotal > 0 ? formatCurrency(categoryTotal) : '-'}
                  </TableCell>

                  {/* 各日のセル */}
                  {props.dates.map((date) => {
                    const matchingExpenses = props.expenses.filter(
                      (e) =>
                        e.payment_date === date && e.category === cat.category,
                    );
                    const totalAmount = matchingExpenses.reduce(
                      (sum, e) => sum + e.amount,
                      0,
                    );
                    const isToday = date === props.todayStr;
                    const dateObj = parseISO(date);
                    const isSun = isSunday(dateObj);
                    const isSat = isWeekend(dateObj) && !isSun;

                    return (
                      <TableCell
                        key={date}
                        align="right"
                        sx={{
                          bgcolor: isToday
                            ? APP_COLORS.today.cell
                            : isSun
                              ? APP_COLORS.sunday.cell
                              : isSat
                                ? APP_COLORS.saturday.cell
                                : 'white',
                          border: '1px solid #f0f0f0',
                          color: totalAmount > 0 ? 'inherit' : '#ccc',
                          fontSize: '0.7rem',
                          px: 0.5,
                        }}
                      >
                        {totalAmount > 0 ? formatCurrency(totalAmount) : '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}

            {/* 日別合計行 */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  bgcolor: APP_COLORS.mainGreen,
                  color: 'white',
                  borderRight: `2px solid ${APP_COLORS.background}`,
                }}
              >
                日計
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 100,
                  zIndex: 10,
                  bgcolor: APP_COLORS.mainGreen,
                  color: 'white',
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: '0.75rem',
                }}
              >
                {formatCurrency(monthlyTotal)}
              </TableCell>
              {props.dates.map((date) => {
                const dayTotal = getDayTotal(date);
                const isToday = date === props.todayStr;

                return (
                  <TableCell
                    key={date}
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      bgcolor: isToday ? APP_COLORS.today.cell : '#fafafa',
                      border: '1px solid #e0e0e0',
                      color: dayTotal > 0 ? APP_COLORS.mainGreen : '#ccc',
                      fontSize: '0.7rem',
                      px: 0.5,
                    }}
                  >
                    {dayTotal > 0 ? formatCurrency(dayTotal) : '-'}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
