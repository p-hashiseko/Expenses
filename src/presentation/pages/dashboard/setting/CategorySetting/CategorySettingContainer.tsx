import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CATEGORY, type Category } from '../../../../../domain/const/Category';
import type { CategoryConfigInput } from '../../../../../domain/models/CategoryConfig';
import { CategoryConfigRepository } from '../../../../../infrastructure/repositories/CategoryConfigRepository';
import { useAuth } from '../../../../state/AuthContext';
import { CategorySettingPresenter } from './CategorySettingPresenter';

export const CategorySettingContainer: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const categoryKeys = Object.keys(CATEGORY) as Category[];

  // DBから設定を取得する関数
  const fetchCurrentConfig = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await CategoryConfigRepository.getCategoryConfig(user.id);

      if (data && data.length > 0) {
        const sortedInits = data
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
          .map((d) => d.category as Category)
          .filter((key) => CATEGORY[key] !== undefined);

        setSelectedCategories(sortedInits);
      } else {
        // 初回などでデータがない場合は全選択状態にするなどのデフォルト処理（任意）
        setSelectedCategories([]);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentConfig();
  }, [fetchCurrentConfig]);

  const handleToggleCategory = (key: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleDragStart = (id: string) => setActiveId(id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedCategories((items) => {
        const oldIndex = items.indexOf(active.id as Category);
        const newIndex = items.indexOf(over.id as Category);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDeleteCategory = (id: string) => {
    setSelectedCategories((prev) => prev.filter((k) => k !== id));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      // 既存データを一旦削除（Repository側の実装に合わせて調整）
      await CategoryConfigRepository.deleteCategoryConfig(user.id);

      if (selectedCategories.length > 0) {
        const payload: CategoryConfigInput[] = selectedCategories.map(
          (cat, index) => ({
            category: cat,
            sort: index,
          }),
        );
        await CategoryConfigRepository.saveCategoryConfig(user.id, payload);
      }

      alert('カテゴリ設定を保存しました');
      // 保存完了後、再度DBから読み込んで整合性を保つ
      await fetchCurrentConfig();
    } catch (e) {
      console.error('Save error:', e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CategorySettingPresenter
      onBack={onBack}
      categoryKeys={categoryKeys}
      selectedCategories={selectedCategories}
      loading={loading}
      saving={saving}
      activeId={activeId}
      sensors={sensors}
      onToggleCategory={handleToggleCategory}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDeleteCategory={handleDeleteCategory}
      onSave={handleSave}
    />
  );
};
