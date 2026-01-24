import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

import { APP_COLORS } from '../../color.config';
import type { Category } from '../../domain/models/Category';
import type { ExpensesObjectiveConfig } from '../../domain/models/ExpensesObjectiveConfig';
import { SecondaryAddButton } from './SecondaryAddButton';

// 数値をカンマ区切り文字列に変換するヘルパー
const formatNumber = (val: number | null) => {
  if (val === null) return '';
  return val.toLocaleString();
};

// カンマを除去して数値に戻すヘルパー
const parseNumber = (val: string) => {
  const num = parseInt(val.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// --- 1. 個別の行コンポーネント ---
export type RecurringItemRowProps = {
  item: ExpensesObjectiveConfig;
  index: number;
  categories: Category[];
  onUpdate: (index: number, key: keyof ExpensesObjectiveConfig, value: any) => void;
  onRemove: (index: number) => void;
  amountDisabled?: boolean;
};

export const RecurringItemRow: React.FC<RecurringItemRowProps> = ({
  item,
  index,
  categories,
  onUpdate,
  onRemove,
  amountDisabled = false,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      border: `1px solid ${APP_COLORS.lightGray}`,
      borderRadius: 3,
      bgcolor: APP_COLORS.white,
    }}
  >
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="毎月の日付"
          type="number"
          size="small"
          value={item.day}
          onChange={(e) => onUpdate(index, 'day', Number(e.target.value))}
          sx={{ width: 140 }}
          InputProps={{
            inputProps: { min: 1, max: 31 },
            endAdornment: <Typography variant="caption">日</Typography>,
          }}
        />

        <FormControl fullWidth size="small">
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={item.categoryId}
            label="カテゴリ"
            onChange={(e) => onUpdate(index, 'categoryId', e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.category_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="メモ"
          placeholder="用途など"
          fullWidth
          size="small"
          value={item.memo || ''}
          onChange={(e) => onUpdate(index, 'memo', e.target.value)}
          sx={{ flex: 2, bgcolor: 'rgba(0,0,0,0.01)' }}
        />

        {amountDisabled ? (
          <Box
            sx={{
              flex: 1.5,
              py: 1,
              px: 1,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: APP_COLORS.textPrimary, opacity: 0.6 }}>
              金額は都度入力
            </Typography>
          </Box>
        ) : (
          <TextField
            label="金額"
            size="small"
            value={formatNumber(item.amount)}
            onChange={(e) => onUpdate(index, 'amount', parseNumber(e.target.value))}
            sx={{ flex: 1.5, '& .MuiInputBase-input': { textAlign: 'right' } }}
            InputProps={{
              endAdornment: (
                <Typography variant="body2" sx={{ ml: 0.5, color: APP_COLORS.textPrimary }}>
                  円
                </Typography>
              ),
            }}
          />
        )}

        {/* ここで渡される index が全体の正しいインデックスになります */}
        <IconButton onClick={() => onRemove(index)} sx={{ color: APP_COLORS.error }}>
          <Delete />
        </IconButton>
      </Stack>
    </Stack>
  </Paper>
);

// --- 2. セクション全体を包むコンポーネント ---
type RecurringSectionProps = {
  title: string;
  isFixed: boolean;
  icon: React.ReactNode;
  items: ExpensesObjectiveConfig[]; // これは「全アイテム」である必要があります
  categories: Category[];
  onUpdate: (index: number, key: keyof ExpensesObjectiveConfig, value: any) => void;
  onRemove: (index: number) => void;
  onAdd: (isFixed: boolean) => void;
  saving?: boolean;
};

export const RecurringSection: React.FC<RecurringSectionProps> = ({
  title,
  isFixed,
  icon,
  items,
  categories,
  onUpdate,
  onRemove,
  onAdd,
  saving = false,
}) => {
  // 表示対象だけをフィルタリング
  const displayItems = items.filter((item) =>
    isFixed ? item.amount !== null : item.amount === null
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          {title}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {displayItems.map((item) => {
          // 重要: filterされた配列ではなく、元の「items（全アイテム）」配列からインデックスを探す
          const actualIndex = items.indexOf(item);

          return (
            <RecurringItemRow
              // key に index を使うのは避け、一意になるような値を生成
              key={`row-${isFixed}-${actualIndex}-${item.categoryId}`}
              item={item}
              index={actualIndex}
              categories={categories}
              onUpdate={onUpdate}
              onRemove={onRemove}
              amountDisabled={!isFixed}
            />
          );
        })}

        <SecondaryAddButton onClick={() => onAdd(isFixed)} disabled={saving} startIcon={<Add />}>
          {title}を追加
        </SecondaryAddButton>
      </Stack>
    </Box>
  );
};
