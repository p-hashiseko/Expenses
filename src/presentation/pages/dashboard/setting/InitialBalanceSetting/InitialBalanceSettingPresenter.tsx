import React from 'react';
import { ArrowBack, AccountBalance } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { APP_COLORS } from '../../../../../color.config';
import { PrimaryActionButton } from '../../../../components/PrimaryActionButton';
import { formatCurrency } from '../../../../../utils/formatters';

interface InitialBalanceSettingPresenterProps {
  amount: number;
  loading: boolean;
  saving: boolean;
  onBack: () => void;
  onAmountChange: (value: string) => void;
  onSave: () => void;
}

export const InitialBalanceSettingPresenter: React.FC<
  InitialBalanceSettingPresenterProps
> = ({ amount, loading, saving, onBack, onAmountChange, onSave }) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 10,
          bgcolor: APP_COLORS.background,
          minHeight: '100vh',
        }}
      >
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          初期所持金の設定
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <AccountBalance sx={{ color: APP_COLORS.mainGreen }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          家計簿開始時の所持金
        </Typography>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: APP_COLORS.textPrimary,
          opacity: 0.7,
          mb: 2,
          display: 'block',
        }}
      >
        ※家計簿を始める前に持っていた金額を入力してください。
        この金額が資産計算の基準となります。
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${APP_COLORS.lightGray}`,
          borderRadius: 3,
          bgcolor: APP_COLORS.white,
          mb: 3,
        }}
      >
        <Stack spacing={2}>
          <TextField
            label="初期所持金"
            type="text"
            inputMode="numeric"
            value={amount === 0 ? '' : formatCurrency(amount)}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            fullWidth
            InputProps={{
              endAdornment: (
                <Typography sx={{ color: APP_COLORS.textPrimary }}>
                  円
                </Typography>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': {
                  borderColor: APP_COLORS.mainGreen,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: APP_COLORS.mainGreen,
              },
            }}
          />
        </Stack>
      </Paper>

      <PrimaryActionButton onClick={onSave} disabled={saving}>
        {saving ? '保存中...' : '保存する'}
      </PrimaryActionButton>
    </Box>
  );
};
