import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { APP_COLORS } from '../../../../color.config';
import { CATEGORY } from '../../../../domain/const/Category';
import {
  formatCurrency,
  sanitizeNumericInput,
} from '../../../../utils/formatters';
import type { ExpenseOutput } from '../../../../domain/models/Expenses';
import type { IncomeOutput } from '../../../../domain/models/Income';
import type { InvestmentOutput } from '../../../../domain/models/Investment';

type Props = {
  open: boolean;
  category: string;
  date: string;
  existingExpenses: ExpenseOutput[];
  existingIncomes: IncomeOutput[];
  existingInvestments: InvestmentOutput[];
  onClose: () => void;
  onAdd: (amount: number, memo: string) => void;
  onUpdate: (id: number, amount: number, memo: string) => void;
  onDelete: (id: number) => void;
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
};

export const ExpenseInputDialog: React.FC<Props> = ({
  open,
  category,
  date,
  existingExpenses,
  existingIncomes,
  existingInvestments,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  onIncomeAdd,
  onIncomeUpdate,
  onIncomeDelete,
  onInvestmentAdd,
  onInvestmentUpdate,
  onInvestmentDelete,
}) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [flow, setFlow] = useState<'in' | 'out'>('in'); // デフォルトは「増やす」

  // 編集モードの状態管理
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMemo, setEditMemo] = useState('');
  const [editFlow, setEditFlow] = useState<'in' | 'out'>('in');

  // 給料の場合は収入データ、投資の場合は投資データ、それ以外は支出データ
  const isSalary = category === 'SALARY';
  const isInvestment = category === 'INVESTMENT';

  // このカテゴリのこの日の既存データをフィルタリング
  const dayExpenses = isSalary
    ? existingIncomes.filter((i) => i.income_day === date)
    : isInvestment
      ? existingInvestments.filter((inv) => inv.invest_day === date)
      : existingExpenses.filter(
          (e) => e.category === category && e.payment_date === date,
        );

  // このカテゴリのこの日の合計
  const totalAmount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = () => {
    const sanitized = sanitizeNumericInput(amount);
    const numAmount = parseFloat(sanitized);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    if (isSalary) {
      onIncomeAdd(numAmount, memo);
    } else if (isInvestment) {
      onInvestmentAdd(numAmount, memo, flow);
    } else {
      onAdd(numAmount, memo);
    }
    setAmount('');
    setMemo('');
    setFlow('in');
  };

  const handleAmountChange = (value: string) => {
    const sanitized = sanitizeNumericInput(value);
    setAmount(sanitized);
  };

  const handleEditAmountChange = (value: string) => {
    const sanitized = sanitizeNumericInput(value);
    setEditAmount(sanitized);
  };

  // 編集モードに入る
  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
    setEditMemo(expense.memo || '');
    if (isInvestment && expense.flow) {
      setEditFlow(expense.flow);
    }
  };

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
    setEditMemo('');
    setEditFlow('in');
  };

  // 更新を保存
  const handleSaveEdit = () => {
    if (editingId === null) return;

    const sanitized = sanitizeNumericInput(editAmount);
    const numAmount = parseFloat(sanitized);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    if (isSalary) {
      onIncomeUpdate(editingId, numAmount, editMemo);
    } else if (isInvestment) {
      onInvestmentUpdate(editingId, numAmount, editMemo, editFlow);
    } else {
      onUpdate(editingId, numAmount, editMemo);
    }
    handleCancelEdit();
  };

  // 削除
  const handleDelete = (id: number) => {
    const confirmMessage = isSalary
      ? 'この収入を削除しますか？'
      : isInvestment
        ? 'この投資を削除しますか？'
        : 'この支出を削除しますか？';
    if (window.confirm(confirmMessage)) {
      if (isSalary) {
        onIncomeDelete(id);
      } else if (isInvestment) {
        onInvestmentDelete(id);
      } else {
        onDelete(id);
      }
    }
  };

  const handleClose = () => {
    setAmount('');
    setMemo('');
    setFlow('in');
    handleCancelEdit();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          margin: 2,
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: APP_COLORS.mainGreen, color: 'white' }}>
        {isSalary
          ? '給料'
          : isInvestment
            ? '投資'
            : CATEGORY[category] || category}
        を追加
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          {date}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          pb: 2,
          overflowY: 'auto',
        }}
      >
        {/* 既存データの表示 */}
        {dayExpenses.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <List dense>
              {dayExpenses.map((expense) => (
                <ListItem
                  key={expense.id}
                  sx={{
                    bgcolor: editingId === expense.id ? '#fff3e0' : '#f5f5f5',
                    mb: 1,
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                  }}
                >
                  {editingId === expense.id ? (
                    // 編集モード
                    <Box
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      {isInvestment && (
                        <Box
                          sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                        >
                          <Typography variant="body2">投資額を</Typography>
                          <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                              value={editFlow}
                              onChange={(e) =>
                                setEditFlow(e.target.value as 'in' | 'out')
                              }
                            >
                              <MenuItem value="in">増やす</MenuItem>
                              <MenuItem value="out">減らす</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      )}
                      <Box
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <TextField
                          size="small"
                          placeholder="0"
                          value={formatCurrency(editAmount)}
                          onChange={(e) =>
                            handleEditAmountChange(e.target.value)
                          }
                          sx={{ flex: 1 }}
                          InputProps={{
                            endAdornment: (
                              <Typography variant="body2">円</Typography>
                            ),
                          }}
                        />
                        <TextField
                          size="small"
                          placeholder="メモ"
                          value={editMemo}
                          onChange={(e) => setEditMemo(e.target.value)}
                          sx={{ flex: 2 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={handleCancelEdit}
                          sx={{ color: '#666' }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleSaveEdit}
                          sx={{ color: '#666' }}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    // 表示モード
                    <>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ minWidth: '80px' }}
                            >
                              {date.replace(/-/g, '/')}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{ minWidth: '90px' }}
                            >
                              {formatCurrency(expense.amount)}円
                            </Typography>
                            {isInvestment && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: '60px' }}
                              >
                                {(expense as any).flow === 'in'
                                  ? '増やす'
                                  : '減らす'}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ flex: 1 }}
                            >
                              {expense.memo || ''}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(expense)}
                          sx={{ color: '#666' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(expense.id)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ minWidth: '80px' }}
              >
                合計
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ minWidth: '90px' }}
              >
                {formatCurrency(totalAmount)}円
              </Typography>
            </Box>
          </Box>
        )}

        {/* 入力フォーム */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isInvestment && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2">投資額を</Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={flow}
                  onChange={(e) => setFlow(e.target.value as 'in' | 'out')}
                >
                  <MenuItem value="in">増やす</MenuItem>
                  <MenuItem value="out">減らす</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="0"
              value={formatCurrency(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              autoFocus
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: <Typography variant="body2">円</Typography>,
              }}
            />
            <TextField
              size="small"
              placeholder="メモ"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              sx={{ flex: 2 }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          キャンセル
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          sx={{
            bgcolor: APP_COLORS.mainGreen,
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: APP_COLORS.mainGreen,
              opacity: 0.9,
              boxShadow: 'none',
            },
          }}
        >
          追加する
        </Button>
      </DialogActions>
    </Dialog>
  );
};
