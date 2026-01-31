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
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { APP_COLORS } from '../../../../color.config';
import { CATEGORY } from '../../../../domain/const/Category';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
import {
  formatCurrency,
  formatDateWithDay,
} from '../../../../utils/formatters';

type Props = {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  dates: string[];
  categories: any[];
  expenses: any[];
  selectedDate: string;
  todayStr: string;
  editValues: { [key: string]: { amount: string; memo: string } };
  loading: boolean;
  saving: boolean;
  onDateSelect: (date: string) => void;
  onInputChange: (cat: string, field: 'amount' | 'memo', val: string) => void;
  onSave: () => void;
};

const buildTodaySummary = (expenses: any[], date: string, category: string) => {
  const records = expenses.filter(
    (e) => e.payment_date === date && e.category === category,
  );

  const total = records.reduce((sum, r) => sum + r.amount, 0);

  return {
    total,
    records, // amount + memo をそのまま持つ
  };
};

export const ExpenseEntryPresenter: React.FC<Props> = (props) => {
  if (props.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 1,
        height: '78vh',
        bgcolor: APP_COLORS.background,
      }}
    >
      {/* 左側: Excel風グリッド */}
      <TableContainer
        ref={props.tableContainerRef}
        component={Paper}
        sx={{
          flex: 2,
          borderRadius: 2,
          overflowX: 'auto',
          position: 'relative',
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  bgcolor: APP_COLORS.lightGray,
                  fontWeight: 'bold',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  minWidth: 100,
                  borderRight: `2px solid ${APP_COLORS.background}`,
                }}
              >
                カテゴリ
              </TableCell>
              {props.dates.map((date) => {
                const isToday = date === props.todayStr;
                const isSelected = props.selectedDate === date;

                return (
                  <TableCell
                    key={date}
                    align="center"
                    onClick={() => props.onDateSelect(date)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? APP_COLORS.mainGreen
                        : isToday
                          ? '#fff3e0'
                          : APP_COLORS.lightGray,
                      color: isSelected
                        ? 'white'
                        : isToday
                          ? '#e65100'
                          : 'inherit',
                      minWidth: 90,
                      fontWeight: isSelected || isToday ? 'bold' : 'normal',
                      transition: '0.2s',
                      whiteSpace: 'nowrap',
                      borderBottom: isToday ? `2px solid #ffb74d` : 'none',
                    }}
                  >
                    {isToday ? '今日' : formatDateWithDay(date)}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.categories.map((cat) => (
              <TableRow key={cat.category} hover>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: '#f8f8f8',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5,
                    borderRight: `2px solid ${APP_COLORS.background}`,
                    boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {CATEGORY[cat.category] || cat.category}
                </TableCell>
                {props.dates.map((date) => {
                  const data = props.expenses.find(
                    (e) =>
                      e.payment_date === date && e.category === cat.category,
                  );
                  const isToday = date === props.todayStr;
                  const isSelected = props.selectedDate === date;

                  return (
                    <TableCell
                      key={date}
                      align="right"
                      onClick={() => props.onDateSelect(date)}
                      sx={{
                        bgcolor: isSelected
                          ? '#f1f8f1'
                          : isToday
                            ? '#fffde7'
                            : 'white',
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#fafafa' },
                        color: data ? 'inherit' : '#ccc',
                      }}
                    >
                      {data ? formatCurrency(data.amount) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 右側: 入力フォーム */}
      <Paper
        sx={{
          flex: 1,
          p: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 400,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: APP_COLORS.mainGreen,
            borderBottom: `2px solid ${APP_COLORS.mainGreen}`,
            pb: 1,
          }}
        >
          {props.selectedDate === props.todayStr
            ? '今日'
            : formatDateWithDay(props.selectedDate)}{' '}
          の入力
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 1, pr: 1 }}>
          <Stack spacing={2.5}>
            {props.categories.map((cat) => (
              <Box key={cat.category}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    mb: 0.5,
                    color: '#555',
                  }}
                >
                  {CATEGORY[cat.category] || cat.category}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="0"
                    value={formatCurrency(
                      props.editValues[cat.category]?.amount || '',
                    )}
                    onChange={(e) =>
                      props.onInputChange(
                        cat.category,
                        'amount',
                        e.target.value,
                      )
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">円</InputAdornment>
                      ),
                    }}
                    // 要望2: 金額欄を2文字分(約30px)広くしました (130px -> 160px)
                    sx={{ width: '160px' }}
                  />

                  <TextField
                    size="small"
                    placeholder="メモ"
                    fullWidth
                    value={props.editValues[cat.category]?.memo || ''}
                    onChange={(e) =>
                      props.onInputChange(cat.category, 'memo', e.target.value)
                    }
                  />
                </Stack>
                {(() => {
                  const summary = buildTodaySummary(
                    props.expenses,
                    props.selectedDate,
                    cat.category,
                  );

                  return (
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: '#888',
                        mt: 0.5,
                        ml: 0.5,
                      }}
                    >
                      合計：{formatCurrency(summary.total)} 円
                      {summary.total > 0 && summary.records.length > 0 && (
                        <>
                          （
                          {summary.records.map((r, idx) => (
                            <React.Fragment key={idx}>
                              <Tooltip
                                title={r.memo || '（メモなし）'}
                                arrow
                                placement="top"
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    textDecoration: r.memo
                                      ? 'underline dotted'
                                      : 'none',
                                    cursor: r.memo ? 'help' : 'default',
                                  }}
                                >
                                  {formatCurrency(r.amount)}
                                </Box>
                              </Tooltip>
                              {idx < summary.records.length - 1 && ' + '}
                            </React.Fragment>
                          ))}
                          ）
                        </>
                      )}
                    </Typography>
                  );
                })()}
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <PrimaryActionButton onClick={props.onSave} disabled={props.saving}>
            {props.saving ? '保存中...' : '保存する'}
          </PrimaryActionButton>
        </Box>
      </Paper>
    </Box>
  );
};
