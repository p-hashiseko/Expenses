import { ArrowBack, ReceiptLong, Tune } from '@mui/icons-material';
import { Box, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../../color.config';
import type { Category } from '../../../../domain/models/Category';
import type { ExpensesObjectiveConfigFront } from '../../../../domain/models/ExpensesObjectiveConfig';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';
import { ExpensesObjectiveConfigRepository } from '../../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
import { RecurringSection } from '../../../components/RecurringItemRow';
import { useAuth } from '../../../state/AuthContext';

export const FixedCostSetting: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ExpensesObjectiveConfigFront[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- データ取得 ---
  const fetchData = async () => {
    if (!user) return;
    try {
      const [catData, configData] = await Promise.all([
        CategoryRepository.getCategories(user.id),
        ExpensesObjectiveConfigRepository.getConfigs(user.id),
      ]);
      setCategories(catData);
      setItems(configData);
    } catch (e) {
      console.error('データの取得に失敗しました:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();
  }, [user]);

  // --- アイテム追加 ---
  const addItem = (isFixed: boolean) => {
    if (!user) return;
    if (categories.length === 0) {
      alert('先にカテゴリ設定からカテゴリを登録してください');
      return;
    }

    const newItem: ExpensesObjectiveConfigFront = {
      tempId: crypto.randomUUID(),
      userId: user.id,
      day: 1,
      categoryId: categories[0].id,
      amount: isFixed ? 0 : null, // 固定費なら0、変動費ならnull
      memo: '',
    };
    setItems([...items, newItem]);
  };

  // --- アイテム削除 ---
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // --- アイテム更新 ---
  const updateItem = (index: number, key: keyof ExpensesObjectiveConfigFront, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  // --- 保存処理 ---
  const handleSave = async () => {
    if (!user) return;

    // バリデーション: 固定費(amountがnull以外)の中に、0以下の数値があるかチェック
    const hasInvalidFixedCost = items.some((item) => item.amount !== null && item.amount <= 0);

    if (hasInvalidFixedCost) {
      alert('固定費の金額には 0 より大きい数値を入力してください。');
      return;
    }

    try {
      setSaving(true);
      await ExpensesObjectiveConfigRepository.saveConfigs(user.id, items);
      alert('設定を保存しました');
      // 画面を戻さず、最新のID等を反映するために再取得
      await fetchData();
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

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          固定費・変動費の自動設定
        </Typography>
      </Stack>

      {/* 固定費セクション */}
      <RecurringSection
        title="固定費"
        isFixed={true}
        icon={<ReceiptLong sx={{ color: APP_COLORS.mainGreen }} />}
        items={items}
        categories={categories}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
        saving={saving}
      />

      <Divider sx={{ my: 4, borderColor: APP_COLORS.lightGray }} />

      {/* 変動費セクション */}
      <RecurringSection
        title="変動費"
        isFixed={false}
        icon={<Tune sx={{ color: APP_COLORS.mainGreen }} />}
        items={items}
        categories={categories}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
        saving={saving}
      />

      {/* 保存ボタン */}
      <Box sx={{ mt: 6, pb: 10 }}>
        <PrimaryActionButton onClick={handleSave} disabled={saving || categories.length === 0}>
          {saving ? '保存中...' : '設定を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
