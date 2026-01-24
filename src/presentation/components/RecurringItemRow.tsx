import React from 'react';
import { Box, Typography, Paper, TextField, IconButton, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { APP_COLORS } from '../../color.config';
import type { Category } from '../../domain/models/Category';

export interface RecurringItem {
  id?: string;
  day: number;
  category_id: string;
  amount: number | null;
  is_fixed: boolean;
}

export type RecurringItemRowProps = {
  item: RecurringItem;
  index: number;
  categories: Category[];
  onUpdate: (index: number, key: keyof RecurringItem, value: any) => void;
  onRemove: (index: number) => void;
  amountDisabled?: boolean;
};

export const RecurringItemRow: React.FC<RecurringItemRowProps> = ({ item, index, categories, onUpdate, onRemove, amountDisabled = false }) => (
  <Paper
    elevation={0}
    sx={{ p: 2, border: `1px solid ${APP_COLORS.lightGray}`, borderRadius: 3, bgcolor: APP_COLORS.white }}
  >
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="毎月の日付"
          type="number"
          size="small"
          value={item.day}
          onChange={(e) => onUpdate(index, 'day', Number(e.target.value))}
          sx={{ width: 120 }}
          InputProps={{ inputProps: { min: 1, max: 31 }, endAdornment: <Typography variant="caption">日</Typography> }}
        />

        <FormControl fullWidth size="small">
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={item.category_id}
            label="カテゴリ"
            onChange={(e) => onUpdate(index, 'category_id', e.target.value)}
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
        {amountDisabled ? (
          <Box sx={{ flex: 1, py: 1, px: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: APP_COLORS.textPrimary, opacity: 0.6 }}>
              金額は実行時に入力（変動費）
            </Typography>
          </Box>
        ) : (
          <TextField
            label="金額"
            type="number"
            size="small"
            fullWidth
            value={item.amount === null ? '' : item.amount}
            onChange={(e) => onUpdate(index, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
            InputProps={{ endAdornment: <Typography variant="body2">円</Typography> }}
          />
        )}
        <IconButton onClick={() => onRemove(index)} sx={{ color: APP_COLORS.error }}>
          <Delete />
        </IconButton>
      </Stack>
    </Stack>
  </Paper>
);
