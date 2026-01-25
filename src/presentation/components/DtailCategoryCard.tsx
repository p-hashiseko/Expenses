import { Check, Close, Edit } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';

import React, { useState } from 'react';

import { APP_COLORS } from '../../color.config';
import type { Expense } from '../../domain/models/Expenses';
import { ExpensesRepository } from '../../infrastructure/repositories/ExpensesRepository';
import { formatCurrency, formatFullDateTime, sanitizeNumericInput } from '../../utils/formatters';

interface DetailCategoryCardProps {
  categoryName: string;
  items: Expense[];
  onRefresh: () => void;
  isHighlighted?: boolean;
}

export const DetailCategoryCard: React.FC<DetailCategoryCardProps> = ({
  categoryName,
  items,
  onRefresh,
  isHighlighted = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState('');
  const [editAmount, setEditAmount] = useState<string>(''); // 数値のみを文字列で保持

  // 編集開始
  const handleEditStart = (item: Expense) => {
    if (!item.id) return;

    setEditingId(item.id);
    setEditMemo(item.memo || '');
    setEditAmount(item.amount.toString());
  };

  // 編集キャンセル
  const handleCancel = () => {
    setEditingId(null);
  };

  // 保存処理
  const handleSave = async (id: string) => {
    // 保存前に sanitizeNumericInput で最終クリーニング
    const cleanedAmount = sanitizeNumericInput(editAmount);
    const numAmount = parseInt(cleanedAmount, 10);

    if (isNaN(numAmount)) {
      alert('有効な金額を入力してください');
      return;
    }

    try {
      await ExpensesRepository.updateExpense(id, {
        memo: editMemo,
        amount: numAmount,
      });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('更新失敗:', error);
      alert('更新に失敗しました');
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${APP_COLORS.lightGray}`,
        bgcolor: isHighlighted ? APP_COLORS.highlightGreen : APP_COLORS.white,
        transition: 'background-color 0.3s ease',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: APP_COLORS.mainGreen,
          fontWeight: 'bold',
          mb: 1.5,
          borderLeft: `4px solid ${APP_COLORS.mainGreen}`,
          pl: 1,
        }}
      >
        {categoryName}
      </Typography>

      <Box sx={{ width: '100%' }}>
        {/* ヘッダー行 */}
        <Box
          sx={{
            display: 'flex',
            pb: 0.5,
            borderBottom: `1px solid ${APP_COLORS.lightGray}`,
            mb: 1,
          }}
        >
          <Typography sx={{ flex: 2, fontSize: '0.7rem', color: 'gray' }}>メモ</Typography>
          <Typography sx={{ flex: 1, fontSize: '0.7rem', color: 'gray', textAlign: 'right' }}>
            金額
          </Typography>
          <Typography sx={{ flex: 2, fontSize: '0.7rem', color: 'gray', textAlign: 'right' }}>
            記入時間
          </Typography>
          <Box sx={{ width: 70 }} />
        </Box>

        <Stack spacing={1.5}>
          {items.map((item) => {
            if (!item.id) return null;

            const isEditing = editingId === item.id;

            return (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                {isEditing ? (
                  <>
                    <TextField
                      size="small"
                      variant="standard"
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      sx={{ flex: 2, '& .MuiInput-input': { fontSize: '0.85rem' } }}
                    />
                    <TextField
                      size="small"
                      variant="standard"
                      // 入力時は formatCurrency を通してカンマを表示
                      value={formatCurrency(editAmount)}
                      onChange={(e) => {
                        const sanitized = sanitizeNumericInput(e.target.value);
                        setEditAmount(sanitized);
                      }}
                      inputProps={{ inputMode: 'numeric' }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography sx={{ fontSize: '0.7rem', color: 'gray' }}>円</Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1.2,
                        mx: 1,
                        '& .MuiInput-input': {
                          fontSize: '0.85rem',
                          textAlign: 'right',
                        },
                      }}
                    />
                    <Box sx={{ flex: 1.8 }} />
                    <Box sx={{ width: 70, textAlign: 'right', display: 'flex' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSave(item.id!)}
                        sx={{ color: APP_COLORS.mainGreen }}
                      >
                        <Check sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={handleCancel}
                        sx={{ color: APP_COLORS.error }}
                      >
                        <Close sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography sx={{ flex: 2, fontSize: '0.85rem' }}>
                      {item.memo || '-'}
                    </Typography>
                    <Typography
                      sx={{ flex: 1, fontSize: '0.85rem', textAlign: 'right', fontWeight: 'bold' }}
                    >
                      {formatCurrency(item.amount)}
                    </Typography>
                    <Typography
                      sx={{ flex: 2, fontSize: '0.7rem', textAlign: 'right', color: 'gray' }}
                    >
                      {item.createdAt ? formatFullDateTime(item.createdAt) : '-'}
                    </Typography>
                    <Box sx={{ width: 70, textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        sx={{ color: APP_COLORS.mainGreen, p: 0.5 }}
                        onClick={() => handleEditStart(item)}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};
