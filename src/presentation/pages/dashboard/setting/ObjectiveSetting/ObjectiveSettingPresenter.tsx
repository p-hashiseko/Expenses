import { ArrowBack, TrackChanges } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { APP_COLORS } from '../../../../../color.config';
import { CATEGORY } from '../../../../../domain/const/Category';
import type { CategoryConfigOutput } from '../../../../../domain/models/CategoryConfig';
import { CategoryInputField } from '../../../../components/CategoryInputField';
import { PrimaryActionButton } from '../../../../components/PrimaryActionButton';

type Props = {
  categories: CategoryConfigOutput[];
  amountInputs: { [key: string]: string };
  displayTotal: number;
  loading: boolean;
  saving: boolean;
  onBack: () => void;
  onAmountChange: (categoryId: string, val: string) => void;
  onBlur: () => void;
  onSave: () => void;
};

export const ObjectiveSettingPresenter: React.FC<Props> = ({
  categories,
  amountInputs,
  displayTotal,
  loading,
  saving,
  onBack,
  onAmountChange,
  onBlur,
  onSave,
}) => {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        py={10}
        bgcolor={APP_COLORS.background}
        minHeight="100vh"
      >
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}
        >
          月間目標金額の設定
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: APP_COLORS.white,
          borderRadius: 2,
          border: `1px solid ${APP_COLORS.lightGray}50`,
        }}
      >
        <TrackChanges
          sx={{ color: APP_COLORS.mainGreen, mr: 1, fontSize: 20 }}
        />
        <Typography
          variant="body2"
          sx={{ color: APP_COLORS.textPrimary, opacity: 0.8 }}
        >
          各カテゴリの1ヶ月の予算（目標）を入力してください。
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${APP_COLORS.lightGray}`,
          bgcolor: 'white',
        }}
      >
        <Stack spacing={0}>
          {categories.length === 0 ? (
            <Typography
              sx={{ p: 2, textAlign: 'center', color: APP_COLORS.textPrimary }}
            >
              カテゴリを登録してください
            </Typography>
          ) : (
            categories.map((cat) => (
              <CategoryInputField
                key={cat.category}
                // CATEGORY定数から日本語名を取得。なければ cat.category を表示
                label={CATEGORY[cat.category] || cat.category}
                value={amountInputs[cat.category] || ''}
                alreadyPaid={0}
                memoValue=""
                showMemo={false}
                onChange={(val) => onAmountChange(cat.category, val)}
                onMemoChange={() => {}}
                onBlur={onBlur}
              />
            ))
          )}
        </Stack>
      </Paper>

      {/* 合計金額表示 */}
      <Box
        sx={{
          mt: 3,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <Typography
          sx={{
            fontWeight: 'bold',
            color: APP_COLORS.textPrimary,
            fontSize: '0.9rem',
          }}
        >
          目標合計額
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: APP_COLORS.mainGreen }}
        >
          ¥ {displayTotal.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, pb: 10 }}>
        <PrimaryActionButton onClick={onSave} disabled={saving}>
          {saving ? '保存中...' : '目標を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
