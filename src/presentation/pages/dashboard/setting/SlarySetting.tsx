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

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../../color.config';
import type { IncomeConfigFront } from '../../../../domain/models/IncomeConfig';
import { IncomeConfigRepository } from '../../../../infrastructure/repositories/IncomeConfigRepository';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
import { useAuth } from '../../../state/AuthContext';

// --- ヘルパー関数 ---
const formatNumber = (val: number | null) => {
  if (val === null || val === 0) return '0';
  return val.toLocaleString();
};

const parseNumber = (val: string) => {
  const num = parseInt(val.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

export const SalarySetting: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<IncomeConfigFront[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initData = async () => {
    if (!user) return;
    try {
      const data = await IncomeConfigRepository.getConfigs(user.id);
      const filledData = [...data];
      while (filledData.length < 3) {
        filledData.push({
          tempId: crypto.randomUUID(),
          userId: user.id,
          income_config_day: 25,
          amount: 0,
          memo: '',
        });
      }
      setItems(filledData.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initData();
      setLoading(false);
    };
    init();
  }, [user]);

  const updateItem = (index: number, key: keyof IncomeConfigFront, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await IncomeConfigRepository.saveConfigs(user.id, items);
      alert('給料設定を保存しました');
      await initData();
    } catch (e) {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
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
        sx={{ color: APP_COLORS.textPrimary, opacity: 0.7, mb: 2, display: 'block' }}
      >
        ※最大3つまで登録できます。不要な項目は金額を0にして保存してください。
      </Typography>

      <Stack spacing={2}>
        {items.map((item, index) => (
          <Paper
            key={item.tempId}
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
                  type="number" // 日付はスピンボタンあっても良い想定ですが、不要ならここも text に変更可能です
                  size="small"
                  sx={{ width: 120 }}
                  value={item.income_config_day}
                  onChange={(e) => updateItem(index, 'income_config_day', Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 1, max: 31 },
                    endAdornment: <Typography variant="caption">日</Typography>,
                  }}
                />
                <TextField
                  label="名称・メモ"
                  placeholder="例：本業、副業など"
                  fullWidth
                  size="small"
                  value={item.memo}
                  onChange={(e) => updateItem(index, 'memo', e.target.value)}
                />
              </Stack>

              <TextField
                label="手取り金額"
                fullWidth
                size="small"
                // type="number" を削除（カンマ表示 & スピンボタン非表示のため）
                value={formatNumber(item.amount)}
                onChange={(e) => updateItem(index, 'amount', parseNumber(e.target.value))}
                sx={{
                  '& .MuiInputBase-input': {
                    textAlign: 'right', // 右揃え
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" sx={{ ml: 0.5, color: APP_COLORS.textPrimary }}>
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
        <PrimaryActionButton onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
