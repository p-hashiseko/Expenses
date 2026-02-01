import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  InputAdornment,
} from '@mui/material';
import { APP_COLORS } from '../../../../color.config';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
import { formatCurrency } from '../../../../utils/formatters';

type Props = {
  amount: string;
  memo: string;
  incomeDate: string;
  saving: boolean;
  onAmountChange: (value: string) => void;
  onMemoChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSave: () => void;
};

export const IncomeEntryPresenter: React.FC<Props> = ({
  amount,
  memo,
  incomeDate,
  saving,
  onAmountChange,
  onMemoChange,
  onDateChange,
  onSave,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        bgcolor: APP_COLORS.background,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          borderRadius: 3,
          bgcolor: 'white',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            color: APP_COLORS.textPrimary,
            textAlign: 'center',
          }}
        >
          給料入力
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="入金日"
            type="date"
            value={incomeDate}
            onChange={(e) => onDateChange(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: APP_COLORS.mainGreen,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: APP_COLORS.mainGreen,
              },
            }}
          />

          <TextField
            label="金額"
            type="text"
            value={formatCurrency(amount)}
            onChange={(e) => onAmountChange(e.target.value)}
            fullWidth
            placeholder="300,000"
            inputMode="numeric"
            InputProps={{
              endAdornment: <InputAdornment position="end">円</InputAdornment>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: APP_COLORS.mainGreen,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: APP_COLORS.mainGreen,
              },
            }}
            helperText="半角数字で入力してください"
          />

          <TextField
            label="メモ（任意）"
            type="text"
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="給料、ボーナスなど"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: APP_COLORS.mainGreen,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: APP_COLORS.mainGreen,
              },
            }}
          />

          <PrimaryActionButton onClick={onSave} disabled={saving || !amount}>
            {saving ? '保存中...' : '保存'}
          </PrimaryActionButton>
        </Stack>
      </Paper>
    </Box>
  );
};
