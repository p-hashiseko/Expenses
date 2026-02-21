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
import { APP_COLORS } from '../../../../../../color.config';
import { CATEGORY } from '../../../../../../domain/const/Category'; // インポート
import type { CategoryConfigOutput } from '../../../../../../domain/models/CategoryConfig';
import type { FixedCostsConfigOutput } from '../../../../../../domain/models/FixedCostsConfig';
import {
  formatCurrency,
  sanitizeNumericInput,
} from '../../../../../../utils/formatters';
import { SecondaryAddButton } from '../../../../../components/SecondaryAddButton';

// UI管理用に tempId を付与した型を定義
export interface FixedCostsConfigUI extends FixedCostsConfigOutput {
  tempId: string;
}

// --- 1. 個別の行コンポーネント ---
export type RecurringItemRowProps = {
  item: FixedCostsConfigUI;
  index: number;
  categories: CategoryConfigOutput[];
  onUpdate: (index: number, key: keyof FixedCostsConfigUI, value: any) => void;
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
          size="small"
          value={item.paymentDate === 0 ? '' : item.paymentDate.toString()}
          onChange={(e) => {
            const val = sanitizeNumericInput(e.target.value);
            const num = val === '' ? 0 : parseInt(val, 10);
            if (num >= 0 && num <= 31) {
              onUpdate(index, 'paymentDate', num);
            }
          }}
          sx={{ width: 140 }}
          InputProps={{
            inputMode: 'numeric',
            endAdornment: <Typography variant="caption">日</Typography>,
          }}
        />

        <FormControl fullWidth size="small">
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={item.category || ''}
            label="カテゴリ"
            onChange={(e) => onUpdate(index, 'category', e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.sort} value={cat.category}>
                {/* CATEGORY定数からマッピングして表示名称(value)を取得 */}
                {CATEGORY[cat.category] || cat.category}
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
            <Typography
              variant="caption"
              sx={{ color: APP_COLORS.textPrimary, opacity: 0.6 }}
            >
              金額は都度入力
            </Typography>
          </Box>
        ) : (
          <TextField
            label="金額"
            size="small"
            placeholder="金額を入力"
            value={
              item.amount === null || item.amount === 0
                ? ''
                : formatCurrency(item.amount)
            }
            onChange={(e) => {
              const val = sanitizeNumericInput(e.target.value);
              // 固定費は 0 で保存（バリデーションで弾かれる）、変動費は null
              onUpdate(index, 'amount', val === '' ? 0 : parseInt(val, 10));
            }}
            sx={{ flex: 1.5, '& .MuiInputBase-input': { textAlign: 'right' } }}
            InputProps={{
              inputMode: 'numeric',
              endAdornment: (
                <Typography
                  variant="body2"
                  sx={{ ml: 0.5, color: APP_COLORS.textPrimary }}
                >
                  円
                </Typography>
              ),
            }}
          />
        )}

        <IconButton
          onClick={() => onRemove(index)}
          sx={{ color: APP_COLORS.error }}
        >
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
  items: FixedCostsConfigUI[];
  categories: CategoryConfigOutput[];
  onUpdate: (index: number, key: keyof FixedCostsConfigUI, value: any) => void;
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
  const displayItems = items.filter((item) =>
    isFixed ? item.amount !== null : item.amount === null,
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}
        >
          {title}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {displayItems.map((item) => {
          const actualIndex = items.indexOf(item);

          return (
            <RecurringItemRow
              key={item.tempId}
              item={item}
              index={actualIndex}
              categories={categories}
              onUpdate={onUpdate}
              onRemove={onRemove}
              amountDisabled={!isFixed}
            />
          );
        })}

        <SecondaryAddButton
          onClick={() => onAdd(isFixed)}
          disabled={saving}
          startIcon={<Add />}
        >
          {title}を追加
        </SecondaryAddButton>
      </Stack>
    </Box>
  );
};
