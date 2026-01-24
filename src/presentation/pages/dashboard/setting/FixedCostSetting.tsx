import { Add, ArrowBack, ReceiptLong, Tune } from '@mui/icons-material';
import { Box, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../../color.config';
import type { Category } from '../../../../domain/models/Category';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';
import { ExpensesObjectiveConfigRepository } from '../../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
import { RecurringItemRow } from '../../../components/RecurringItemRow';
import { useAuth } from '../../../state/AuthContext';

interface RecurringItem {
  id?: string;
  day: number;
  category_id: string;
  amount: number | null; // 変動費はnullを許容
  is_fixed: boolean; // 固定費か変動費かを判別するフラグ
}

export const FixedCostSetting: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // DBから「カテゴリ一覧」と「現在の固定費設定」を同時に取得
        const [catData, configData] = await Promise.all([
          CategoryRepository.getCategories(user.id),
          ExpensesObjectiveConfigRepository.getConfigs(user.id),
        ]);

        setCategories(catData);
        setItems(configData);
      } catch (e) {
        console.error('データの取得に失敗しました:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  // アイテム追加処理
  const addItem = (isFixed: boolean) => {
    // カテゴリが1つも登録されていない場合の考慮
    if (categories.length === 0) {
      alert('先にカテゴリ設定からカテゴリを登録してください');
      return;
    }

    const newItem: RecurringItem = {
      day: 1,
      // プルダウンの初期値としてDBから取得した最初のカテゴリIDをセット
      category_id: categories[0].id,
      amount: isFixed ? 0 : null,
      is_fixed: isFixed,
    };
    setItems([...items, newItem]);
  };

  // アイテム削除
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // 各フィールドの更新
  const updateItem = (index: number, key: keyof RecurringItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      // DBへ保存
      await ExpensesObjectiveConfigRepository.saveConfigs(user.id, items);
      alert('設定を保存しました');
      onBack();
    } catch (e) {
      console.error(e);
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

  const renderSection = (title: string, isFixed: boolean, icon: React.ReactNode) => (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          {title}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {items
          .filter((item) => item.is_fixed === isFixed)
          .map((item) => {
            // items配列内での本当のインデックスを探す
            const actualIndex = items.findIndex((i) => i === item);
            return (
              <RecurringItemRow
                key={`${isFixed}-${actualIndex}`}
                item={item}
                index={actualIndex}
                categories={categories}
                onUpdate={updateItem}
                onRemove={removeItem}
                amountDisabled={!isFixed}
              />
            );
          })}

        <PrimaryActionButton
          onClick={() => addItem(isFixed)}
          sx={{
            bgcolor: 'transparent',
            color: APP_COLORS.mainGreen,
            boxShadow: 'none',
            alignSelf: 'flex-start',
            height: 'auto',
            py: 0,
            px: 0,
            '&:hover': { bgcolor: 'rgba(62, 207, 142, 0.08)' },
          }}
        >
          <Add style={{ marginRight: 8 }} />
          {title}を追加
        </PrimaryActionButton>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          固定費・変動費の自動設定
        </Typography>
      </Stack>

      {renderSection('固定費', true, <ReceiptLong sx={{ color: APP_COLORS.mainGreen }} />)}

      <Divider sx={{ my: 4, borderColor: APP_COLORS.lightGray }} />

      {renderSection('変動費', false, <Tune sx={{ color: APP_COLORS.mainGreen }} />)}

      <Box sx={{ mt: 6, pb: 10 }}>
        <PrimaryActionButton
          onClick={handleSave}
          disabled={saving || categories.length === 0}
          sx={{ height: 56, borderRadius: 4 }}
        >
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
