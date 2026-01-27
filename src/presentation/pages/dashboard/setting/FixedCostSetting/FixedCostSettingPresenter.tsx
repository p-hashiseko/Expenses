import { ArrowBack, ReceiptLong, Tune } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  RecurringSection,
  type FixedCostsConfigUI,
} from './component/RecurringItemRow';
import { APP_COLORS } from '../../../../../color.config';
import type { CategoryConfigOutput } from '../../../../../domain/models/CategoryConfig';
import { PrimaryActionButton } from '../../../../components/PrimaryActionButton';

type Props = {
  items: FixedCostsConfigUI[];
  categories: CategoryConfigOutput[];
  loading: boolean;
  saving: boolean;
  onBack: () => void;
  onAdd: (isFixed: boolean) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, key: keyof FixedCostsConfigUI, value: any) => void;
  onSave: () => void;
};

export const FixedCostSettingPresenter: React.FC<Props> = ({
  items,
  categories,
  loading,
  saving,
  onBack,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
}) => {
  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 10,
          minHeight: '100vh',
          bgcolor: APP_COLORS.background,
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
          固定費・変動費の自動設定
        </Typography>
      </Stack>

      <RecurringSection
        title="固定費"
        isFixed={true}
        icon={<ReceiptLong sx={{ color: APP_COLORS.mainGreen }} />}
        items={items}
        categories={categories}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onAdd={onAdd}
        saving={saving}
      />

      <Divider sx={{ my: 4 }} />

      <RecurringSection
        title="変動費"
        isFixed={false}
        icon={<Tune sx={{ color: APP_COLORS.mainGreen }} />}
        items={items}
        categories={categories}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onAdd={onAdd}
        saving={saving}
      />

      <Box sx={{ mt: 6, pb: 10 }}>
        <PrimaryActionButton
          onClick={onSave}
          disabled={saving || categories.length === 0}
        >
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
