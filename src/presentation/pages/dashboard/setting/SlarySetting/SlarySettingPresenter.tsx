import React from 'react';
import { ArrowBack, Payments } from '@mui/icons-material';
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
import type { IncomeConfigOutput } from '../../../../../domain/models/IncomeConfig';
import { PrimaryActionButton } from '../../../../components/PrimaryActionButton';
import { formatCurrency } from '../../../../../utils/formatters';

interface SalarySettingPresenterProps {
  items: IncomeConfigOutput[];
  loading: boolean;
  saving: boolean;
  onBack: () => void;
  onUpdateItem: (
    index: number,
    key: keyof IncomeConfigOutput,
    value: any,
  ) => void;
  onSave: () => void;
}

export const SalarySettingPresenter: React.FC<SalarySettingPresenterProps> = ({
  items,
  loading,
  saving,
  onBack,
  onUpdateItem,
  onSave,
}) => {
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
          給料の設定
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Payments sx={{ color: APP_COLORS.mainGreen }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          毎月の収入
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
        ※最大3つまで登録できます。不要な項目は金額を0にして保存してください。
      </Typography>

      <Stack spacing={2}>
        {items.map((item, index) => (
          <Paper
            key={item.sort}
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
                  label="支給日"
                  type="text"
                  size="small"
                  sx={{ width: 120 }}
                  value={
                    item.income_config_day === 0
                      ? ''
                      : item.income_config_day.toString()
                  }
                  placeholder="25"
                  onChange={(e) =>
                    onUpdateItem(index, 'income_config_day', e.target.value)
                  }
                  InputProps={{
                    endAdornment: <Typography variant="caption">日</Typography>,
                  }}
                />
                <TextField
                  label="名称・メモ"
                  placeholder="例：本業、副業など"
                  fullWidth
                  size="small"
                  value={item.memo}
                  onChange={(e) => onUpdateItem(index, 'memo', e.target.value)}
                />
              </Stack>

              <TextField
                label="手取り金額"
                fullWidth
                size="small"
                type="text"
                value={formatCurrency(item.amount)}
                onChange={(e) => onUpdateItem(index, 'amount', e.target.value)}
                sx={{
                  '& .MuiInputBase-input': {
                    textAlign: 'right',
                  },
                }}
                InputProps={{
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
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Box sx={{ mt: 6, pb: 10 }}>
        <PrimaryActionButton onClick={onSave} disabled={saving}>
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
