import React, { useEffect, useState } from 'react';

import { FixedCostSettingPresenter } from './FixedCostSettingPresenter';
import type { CategoryConfigOutput } from '../../../../../domain/models/CategoryConfig';
import type { FixedCostsConfigInput } from '../../../../../domain/models/FixedCostsConfig';
import { CategoryConfigRepository } from '../../../../../infrastructure/repositories/CategoryConfigRepository';
import { FixedCostsConfigRepository } from '../../../../../infrastructure/repositories/FixedConfigRepository';
import { useAuth } from '../../../../state/AuthContext';
import type { FixedCostsConfigUI } from './component/RecurringItemRow';

export const FixedCostSettingContainer: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryConfigOutput[]>([]);
  const [items, setItems] = useState<FixedCostsConfigUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [catData, configData] = await Promise.all([
        CategoryConfigRepository.getCategoryConfig(user.id),
        FixedCostsConfigRepository.getFixedConfig(user.id),
      ]);

      const sortedCats = [...catData].sort((a, b) => a.sort - b.sort);
      setCategories(sortedCats);

      const uiItems: FixedCostsConfigUI[] = configData.map((item) => ({
        ...item,
        tempId: crypto.randomUUID(),
      }));
      setItems(uiItems);
    } catch (e) {
      console.error('データの取得に失敗しました:', e);
    }
  };

  useEffect(() => {
    if (user) {
      const init = async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);
      };
      init();
    }
  }, [user]);

  const addItem = (isFixed: boolean) => {
    if (!user || categories.length === 0) {
      alert('カテゴリが設定されていません。先にカテゴリ設定を行ってください。');
      return;
    }

    const newItem: FixedCostsConfigUI = {
      tempId: crypto.randomUUID(),
      userId: user.id,
      paymentDate: 1,
      category: categories[0].category,
      amount: isFixed ? 0 : null,
      memo: '',
      sort: items.length,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    key: keyof FixedCostsConfigUI,
    value: any,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!user) return;

    const hasInvalidFixedCost = items.some(
      (item) => item.amount !== null && item.amount <= 0,
    );
    if (hasInvalidFixedCost) {
      alert('固定費の金額には 0 より大きい数値を入力してください。');
      return;
    }

    try {
      setSaving(true);
      const configsToSave: FixedCostsConfigInput[] = items.map(
        (item, index) => ({
          userId: user.id,
          memo: item.memo,
          category: item.category,
          amount: item.amount,
          paymentDate: item.paymentDate,
          sort: index,
        }),
      );

      await FixedCostsConfigRepository.deleteFixedConfig(user.id);

      if (configsToSave.length > 0) {
        await FixedCostsConfigRepository.saveFixedConfig(configsToSave);
      }

      alert('設定を保存しました');
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FixedCostSettingPresenter
      items={items}
      categories={categories}
      loading={loading}
      saving={saving}
      onBack={onBack}
      onAdd={addItem}
      onRemove={removeItem}
      onUpdate={updateItem}
      onSave={handleSave}
    />
  );
};
