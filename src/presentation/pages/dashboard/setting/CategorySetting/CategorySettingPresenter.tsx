import React from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { APP_COLORS } from '../../../../../color.config';
import { CATEGORY, type Category } from '../../../../../domain/const/Category';
import { PrimaryActionButton } from '../../../../components/PrimaryActionButton';
import { SortableCategoryItem } from './components/SortbleCategoryItem';

interface PresenterProps {
  onBack: () => void;
  categoryKeys: Category[];
  selectedCategories: Category[];
  loading: boolean;
  saving: boolean;
  activeId: string | null;
  sensors: SensorDescriptor<SensorOptions>[];
  onToggleCategory: (key: Category) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteCategory: (id: string) => void;
  onSave: () => void;
}

export const CategorySettingPresenter: React.FC<PresenterProps> = (props) => {
  const {
    onBack,
    categoryKeys,
    selectedCategories,
    loading,
    saving,
    activeId,
    sensors,
    onToggleCategory,
    onDragStart,
    onDragEnd,
    onDeleteCategory,
    onSave,
  } = props;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 10,
          height: '100vh',
          bgcolor: APP_COLORS.background,
        }}
      >
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        bgcolor: APP_COLORS.background,
        minHeight: '100vh',
        maxWidth: 'md',
        mx: 'auto',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          カテゴリ表示設定
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="stretch" // 高さ（子要素）を揃える
        sx={{
          height: { md: '60vh' }, // PCサイズ時に高さを固定
          minHeight: 400,
        }}
      >
        {/* 左側：カテゴリ選択（チェックボックス） */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${APP_COLORS.lightGray}`,
            borderRadius: 4,
            overflow: 'hidden', // Paperの角丸からはみ出さないように
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${APP_COLORS.lightGray}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              利用するカテゴリにチェック
            </Typography>
          </Box>
          <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
            <FormGroup
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}
            >
              {categoryKeys.map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedCategories.includes(key)}
                      onChange={() => onToggleCategory(key)}
                      sx={{
                        color: APP_COLORS.mainGreen,
                        '&.Mui-checked': { color: APP_COLORS.mainGreen },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 14 }}>
                      {CATEGORY[key]}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        </Paper>

        {/* 右側：並び替えエリア */}
        <Paper
          elevation={0}
          sx={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${APP_COLORS.lightGray}`,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: APP_COLORS.white,
              borderBottom: `1px solid ${APP_COLORS.lightGray}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              表示順（ドラッグで移動）
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: APP_COLORS.white }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e) => onDragStart(e.active.id as string)}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={selectedCategories}
                strategy={verticalListSortingStrategy}
              >
                <Box sx={{ minHeight: '100%' }}>
                  {selectedCategories.length === 0 ? (
                    <Typography
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        color: APP_COLORS.lightGray,
                      }}
                    >
                      カテゴリを選択してください
                    </Typography>
                  ) : (
                    selectedCategories.map((cat, index) => (
                      <SortableCategoryItem
                        key={cat}
                        id={cat}
                        name={CATEGORY[cat]}
                        index={index}
                        onDelete={onDeleteCategory}
                        isDragging={activeId === cat}
                      />
                    ))
                  )}
                </Box>
              </SortableContext>
            </DndContext>
          </Box>
        </Paper>
      </Stack>

      <Box sx={{ mt: 5, px: 2, pb: 10, maxWidth: 400, mx: 'auto' }}>
        <PrimaryActionButton onClick={onSave} disabled={saving}>
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
