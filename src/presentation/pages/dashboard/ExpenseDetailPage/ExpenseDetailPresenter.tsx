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
  Tooltip,
} from '@mui/material';
import { APP_COLORS } from '../../../../color.config';
import { CATEGORY } from '../../../../domain/const/Category';
import { formatCurrency } from '../../../../utils/formatters';
import { format, parseISO, isWeekend, isSunday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ExpenseInputDialog } from './ExpenseInputDialog';

type Props = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  dates: string[];
  categories: any[];
  expenses: any[];
  incomes: any[];
  investments: any[];
  todayStr: string;
  loading: boolean;
  selectedYear: number;
  selectedMonth: number;
  years: number[];
  months: number[];
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  dialogOpen: boolean;
  selectedCategory: string;
  selectedDate: string;
  onCellClick: (category: string, date: string) => void;
  onDialogClose: () => void;
  onExpenseAdd: (amount: number, memo: string) => void;
  onExpenseUpdate: (id: number, amount: number, memo: string) => void;
  onExpenseDelete: (id: number) => void;
  onIncomeAdd: (amount: number, memo: string) => void;
  onIncomeUpdate: (id: number, amount: number, memo: string) => void;
  onIncomeDelete: (id: number) => void;
  onInvestmentAdd: (amount: number, memo: string, flow: 'in' | 'out') => void;
  onInvestmentUpdate: (
    id: number,
    amount: number,
    memo: string,
    flow: 'in' | 'out',
  ) => void;
  onInvestmentDelete: (id: number) => void;
  initialBalance: number;
  totalIncomeUpToToday: number;
  totalExpensesUpToToday: number;
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

  // 日別収入合計を計算
  const getDayIncome = (date: string) => {
    return props.incomes
      .filter((i) => i.income_day === date)
      .reduce((sum, i) => sum + i.amount, 0);
  };

  // 月間収入合計
  const monthlyIncome = props.incomes.reduce((sum, i) => sum + i.amount, 0);

  // 月間総合計（支出）
  const monthlyTotal = props.expenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0,
  );

  // 現金（累積残高）= 初期所持金 + 全収入 - 全支出
  const cashBalance =
    props.initialBalance +
    props.totalIncomeUpToToday -
    props.totalExpensesUpToToday;

  // 月間投資合計（in - out）
  const monthlyInvestment = props.investments.reduce((sum, inv) => {
    if (inv.flow === 'in') return sum + inv.amount;
    else return sum - inv.amount;
  }, 0);

  // 日別投資金額を取得（in - out）
  const getDayInvestment = (date: string) => {
    return props.investments
      .filter((inv) => inv.invest_day === date)
      .reduce((sum, inv) => {
        if (inv.flow === 'in') return sum + inv.amount;
        else return sum - inv.amount;
      }, 0);
  };

  // ツールチップコンテンツを生成（給料用）
  const formatIncomeTooltip = (date: string): string => {
    const incomes = props.incomes.filter((inc) => inc.income_day === date);
    if (incomes.length === 0) return '';

    const lines: string[] = [];
    const formattedDate = format(parseISO(date), 'yyyy/MM/dd', {
      locale: ja,
    });
    incomes.forEach((income) => {
      lines.push(
        `${formattedDate}  ${formatCurrency(income.amount)}  ${income.memo || ''}`,
      );
    });
    lines.push('────────────────────');
    const total = incomes.reduce((sum, i) => sum + i.amount, 0);
    lines.push(`合計: ${formatCurrency(total)}`);
    return lines.join('\n');
  };

  // ツールチップコンテンツを生成（支出用）
  const formatExpenseTooltip = (category: string, date: string): string => {
    const matchingExpenses = props.expenses.filter(
      (e) => e.payment_date === date && e.category === category,
    );
    if (matchingExpenses.length === 0) return '';

    const lines: string[] = [];
    const formattedDate = format(parseISO(date), 'yyyy/MM/dd', {
      locale: ja,
    });

    // 金額未入力のレコードがあるかチェック
    const hasNullAmount = matchingExpenses.some(
      (exp) => exp.amount === null || exp.amount === 0,
    );

    if (hasNullAmount) {
      lines.push('⚠️ 金額を入力してください');
      lines.push('');
    }

    matchingExpenses.forEach((exp) => {
      const amountText =
        exp.amount === null || exp.amount === 0
          ? '未入力'
          : formatCurrency(exp.amount);
      lines.push(`${formattedDate}  ${amountText}  ${exp.memo || ''}`);
    });
    lines.push('────────────────────');
    const total = matchingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    lines.push(`合計: ${formatCurrency(total)}`);
    return lines.join('\n');
  };

  // ツールチップコンテンツを生成（投資用）
  const formatInvestmentTooltip = (date: string): string => {
    const investments = props.investments.filter(
      (inv) => inv.invest_day === date,
    );
    if (investments.length === 0) return '';

    const lines: string[] = [];
    const formattedDate = format(parseISO(date), 'yyyy/MM/dd', {
      locale: ja,
    });
    investments.forEach((investment) => {
      const flowLabel = investment.flow === 'in' ? '増やす' : '減らす';
      lines.push(
        `${formattedDate}  ${formatCurrency(investment.amount)}  ${flowLabel}`,
      );
    });
    lines.push('────────────────────');
    const total = investments.reduce((sum, inv) => {
      if (inv.flow === 'in') return sum + inv.amount;
      else return sum - inv.amount;
    }, 0);
    lines.push(`合計: ${formatCurrency(total)}`);
    return lines.join('\n');
  };

  return (
    <Box
      sx={{ p: { xs: 0.5, sm: 1 }, display: 'flex', flexDirection: 'column' }}
    >
      {/* ヘッダー: 年月選択 */}
      <Paper sx={{ mb: { xs: 1, sm: 2 }, borderRadius: 2 }} elevation={0}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={props.years.indexOf(props.selectedYear)}
            onChange={(_, index) => props.onYearChange(props.years[index])}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.85rem', sm: '0.875rem' }, // モバイルでフォントサイズ調整
                minHeight: { xs: 42, sm: 48 }, // モバイルで高さ調整
                py: { xs: 1, sm: 1.5 },
              },
            }}
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
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.85rem', sm: '0.875rem' }, // モバイルでフォントサイズ調整
                minHeight: { xs: 42, sm: 48 }, // モバイルで高さ調整
                py: { xs: 1, sm: 1.5 },
              },
            }}
          >
            {props.months.map((m) => (
              <Tab key={m} label={`${m}月`} />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* 月間合計表示 */}
      <Paper
        sx={{ mb: { xs: 1, sm: 2 }, borderRadius: 2 }}
        variant="outlined"
        elevation={0}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: 0 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} // モバイルでフォントサイズ調整
          >
            {props.selectedYear}年{props.selectedMonth}月の合計
          </Typography>
        </Box>
        <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  borderRight: '1px solid #e0e0e0',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }, // モバイルでフォントサイズ調整
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                現金
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  borderRight: '1px solid #e0e0e0',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                収入
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  borderRight: '1px solid #e0e0e0',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                支出
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                投資額
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  borderRight: '1px solid #e0e0e0',
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }} // モバイルでフォントサイズ調整
                  color={cashBalance >= 0 ? APP_COLORS.mainGreen : 'error.main'}
                >
                  {formatCurrency(cashBalance)} 円
                </Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  borderRight: '1px solid #e0e0e0',
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                  color={APP_COLORS.mainGreen}
                >
                  {formatCurrency(monthlyIncome)} 円
                </Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  borderRight: '1px solid #e0e0e0',
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                  color="error.main"
                >
                  {formatCurrency(monthlyTotal)} 円
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ px: { xs: 0.5, sm: 1 } }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                  color={
                    monthlyInvestment >= 0 ? APP_COLORS.mainGreen : 'error.main'
                  }
                >
                  {formatCurrency(monthlyInvestment)} 円
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
                  minWidth: { xs: 80, sm: 100 }, // モバイルで幅調整
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' }, // モバイルでフォントサイズ調整
                  px: { xs: 0.5, sm: 1 },
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
                  left: { xs: 80, sm: 100 }, // モバイルで位置調整
                  zIndex: 20,
                  width: { xs: 70, sm: 80 }, // モバイルで幅調整
                  minWidth: { xs: 70, sm: 80 },
                  maxWidth: { xs: 70, sm: 80 },
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
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
                      width: { xs: 70, sm: 80 }, // モバイルで幅調整
                      minWidth: { xs: 70, sm: 80 },
                      maxWidth: { xs: 70, sm: 80 },
                      fontWeight: isToday ? 'bold' : 'normal',
                      whiteSpace: 'nowrap',
                      borderBottom: isToday
                        ? `2px solid ${APP_COLORS.today.border}`
                        : 'none',
                      px: { xs: 0.3, sm: 0.5 }, // モバイルでパディング調整
                    }}
                  >
                    <Box sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                      {day}
                    </Box>
                    <Box sx={{ fontSize: { xs: '0.55rem', sm: '0.6rem' } }}>
                      {weekday}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* 給料行 */}
            <TableRow hover>
              {/* カテゴリ名 */}
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  bgcolor: '#f8f8f8',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }, // モバイルでフォントサイズ調整
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                給料
              </TableCell>

              {/* 給料合計 */}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  bgcolor: '#f1f8f1',
                  position: 'sticky',
                  left: { xs: 80, sm: 100 }, // モバイルで位置調整
                  zIndex: 10,
                  width: { xs: 70, sm: 80 },
                  minWidth: { xs: 70, sm: 80 },
                  maxWidth: { xs: 70, sm: 80 },
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  px: { xs: 0.3, sm: 0.5 },
                }}
              >
                {monthlyIncome > 0 ? formatCurrency(monthlyIncome) : '-'}
              </TableCell>

              {/* 各日のセル */}
              {props.dates.map((date) => {
                const dayIncome = getDayIncome(date);
                const isToday = date === props.todayStr;
                const dateObj = parseISO(date);
                const isSun = isSunday(dateObj);
                const isSat = isWeekend(dateObj) && !isSun;
                const tooltipContent = formatIncomeTooltip(date);

                const cellContent = (
                  <TableCell
                    key={date}
                    align="right"
                    onClick={() => props.onCellClick('SALARY', date)}
                    sx={{
                      bgcolor: isToday
                        ? APP_COLORS.today.cell
                        : isSun
                          ? APP_COLORS.sunday.cell
                          : isSat
                            ? APP_COLORS.saturday.cell
                            : 'white',
                      border: '1px solid #f0f0f0',
                      color: dayIncome > 0 ? 'inherit' : '#ccc',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' }, // モバイルでフォントサイズ調整
                      width: { xs: 70, sm: 80 },
                      minWidth: { xs: 70, sm: 80 },
                      maxWidth: { xs: 70, sm: 80 },
                      px: { xs: 0.3, sm: 0.5 },
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isToday
                          ? APP_COLORS.today.cell
                          : APP_COLORS.lightGray,
                        opacity: 0.8,
                      },
                    }}
                  >
                    {dayIncome > 0 ? formatCurrency(dayIncome) : '-'}
                  </TableCell>
                );

                return tooltipContent ? (
                  <Tooltip
                    key={date}
                    title={
                      <Box
                        sx={{
                          whiteSpace: 'pre-line',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tooltipContent}
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    {cellContent}
                  </Tooltip>
                ) : (
                  cellContent
                );
              })}
            </TableRow>

            {/* 投資行 */}
            <TableRow hover>
              {/* カテゴリ名 */}
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  bgcolor: '#f8f8f8',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  borderBottom: '3px double #ccc',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                投資
              </TableCell>

              {/* 投資合計 */}
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  bgcolor: '#f1f8f1',
                  position: 'sticky',
                  left: { xs: 80, sm: 100 },
                  zIndex: 10,
                  width: { xs: 70, sm: 80 },
                  minWidth: { xs: 70, sm: 80 },
                  maxWidth: { xs: 70, sm: 80 },
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  borderBottom: '3px double #ccc',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  px: { xs: 0.3, sm: 0.5 },
                }}
              >
                {monthlyInvestment !== 0
                  ? formatCurrency(monthlyInvestment)
                  : '-'}
              </TableCell>

              {/* 各日のセル */}
              {props.dates.map((date) => {
                const dayInvestment = getDayInvestment(date);
                const isToday = date === props.todayStr;
                const dateObj = parseISO(date);
                const isSun = isSunday(dateObj);
                const isSat = isWeekend(dateObj) && !isSun;
                const tooltipContent = formatInvestmentTooltip(date);

                const cellContent = (
                  <TableCell
                    key={date}
                    align="right"
                    onClick={() => props.onCellClick('INVESTMENT', date)}
                    sx={{
                      bgcolor: isToday
                        ? APP_COLORS.today.cell
                        : isSun
                          ? APP_COLORS.sunday.cell
                          : isSat
                            ? APP_COLORS.saturday.cell
                            : 'white',
                      border: '1px solid #f0f0f0',
                      borderBottom: '3px double #ccc',
                      color:
                        dayInvestment !== 0
                          ? dayInvestment > 0
                            ? 'inherit'
                            : 'error.main'
                          : '#ccc',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      width: { xs: 70, sm: 80 },
                      minWidth: { xs: 70, sm: 80 },
                      maxWidth: { xs: 70, sm: 80 },
                      px: { xs: 0.3, sm: 0.5 },
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isToday
                          ? APP_COLORS.today.cell
                          : APP_COLORS.lightGray,
                        opacity: 0.8,
                      },
                    }}
                  >
                    {dayInvestment !== 0 ? formatCurrency(dayInvestment) : '-'}
                  </TableCell>
                );

                return tooltipContent ? (
                  <Tooltip
                    key={date}
                    title={
                      <Box
                        sx={{
                          whiteSpace: 'pre-line',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tooltipContent}
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    {cellContent}
                  </Tooltip>
                ) : (
                  cellContent
                );
              })}
            </TableRow>

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
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      px: { xs: 0.5, sm: 1 },
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
                      left: { xs: 80, sm: 100 },
                      zIndex: 10,
                      width: { xs: 70, sm: 80 },
                      minWidth: { xs: 70, sm: 80 },
                      maxWidth: { xs: 70, sm: 80 },
                      borderRight: `2px solid ${APP_COLORS.background}`,
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      px: { xs: 0.3, sm: 0.5 },
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
                      (sum, e) => sum + (e.amount || 0),
                      0,
                    );
                    // 金額未入力のレコードがあるかチェック
                    const hasNullAmount = matchingExpenses.some(
                      (e) => e.amount === null || e.amount === 0,
                    );
                    const isToday = date === props.todayStr;
                    const dateObj = parseISO(date);
                    const isSun = isSunday(dateObj);
                    const isSat = isWeekend(dateObj) && !isSun;
                    const tooltipContent = formatExpenseTooltip(
                      cat.category,
                      date,
                    );

                    const cellContent = (
                      <TableCell
                        key={date}
                        align="right"
                        onClick={() => props.onCellClick(cat.category, date)}
                        sx={{
                          bgcolor: hasNullAmount
                            ? '#ffebee' // 金額未入力の場合は赤系背景
                            : isToday
                              ? APP_COLORS.today.cell
                              : isSun
                                ? APP_COLORS.sunday.cell
                                : isSat
                                  ? APP_COLORS.saturday.cell
                                  : 'white',
                          border: hasNullAmount
                            ? '2px solid #ef5350' // 金額未入力の場合は赤枠
                            : '1px solid #f0f0f0',
                          color: hasNullAmount
                            ? '#d32f2f' // 金額未入力の場合は赤文字
                            : totalAmount > 0
                              ? 'inherit'
                              : '#ccc',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          width: { xs: 70, sm: 80 },
                          minWidth: { xs: 70, sm: 80 },
                          maxWidth: { xs: 70, sm: 80 },
                          px: { xs: 0.3, sm: 0.5 },
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: hasNullAmount
                              ? '#ffcdd2'
                              : isToday
                                ? APP_COLORS.today.cell
                                : APP_COLORS.lightGray,
                            opacity: 0.8,
                          },
                        }}
                      >
                        {hasNullAmount
                          ? '⚠️未入力'
                          : totalAmount > 0
                            ? formatCurrency(totalAmount)
                            : '-'}
                      </TableCell>
                    );

                    return tooltipContent ? (
                      <Tooltip
                        key={date}
                        title={
                          <Box
                            sx={{
                              whiteSpace: 'pre-line',
                              fontSize: '0.75rem',
                            }}
                          >
                            {tooltipContent}
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        {cellContent}
                      </Tooltip>
                    ) : (
                      cellContent
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
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  px: { xs: 0.5, sm: 1 },
                }}
              >
                日計
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: { xs: 80, sm: 100 },
                  zIndex: 10,
                  bgcolor: APP_COLORS.mainGreen,
                  color: 'white',
                  borderRight: `2px solid ${APP_COLORS.background}`,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  px: { xs: 0.3, sm: 0.5 },
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
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      px: { xs: 0.3, sm: 0.5 },
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

      {/* 支出入力ダイアログ */}
      <ExpenseInputDialog
        open={props.dialogOpen}
        category={props.selectedCategory}
        date={props.selectedDate}
        existingExpenses={props.expenses}
        existingIncomes={props.incomes}
        existingInvestments={props.investments}
        onClose={props.onDialogClose}
        onAdd={props.onExpenseAdd}
        onUpdate={props.onExpenseUpdate}
        onDelete={props.onExpenseDelete}
        onIncomeAdd={props.onIncomeAdd}
        onIncomeUpdate={props.onIncomeUpdate}
        onIncomeDelete={props.onIncomeDelete}
        onInvestmentAdd={props.onInvestmentAdd}
        onInvestmentUpdate={props.onInvestmentUpdate}
        onInvestmentDelete={props.onInvestmentDelete}
      />
    </Box>
  );
};
