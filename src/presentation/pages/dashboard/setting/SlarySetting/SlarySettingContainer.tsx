import React, { useEffect, useState } from 'react';
import type {
  IncomeConfigInput,
  IncomeConfigOutput,
} from '../../../../../domain/models/IncomeConfig';
import { IncomeConfigRepository } from '../../../../../infrastructure/repositories/IncomeConfigRepository';
import { useAuth } from '../../../../state/AuthContext';
import { sanitizeNumericInput } from '../../../../../utils/formatters';
import { SalarySettingPresenter } from './SlarySettingPresenter';

interface SalarySettingContainerProps {
  onBack: () => void;
}

export const SalarySettingContainer: React.FC<SalarySettingContainerProps> = ({
  onBack,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<IncomeConfigOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initData = async () => {
    if (!user) return;
    try {
      const data = await IncomeConfigRepository.getIncomeConfig(user.id);
      const sortedData = [...data].sort((a, b) => a.sort - b.sort);
      const filledData: IncomeConfigOutput[] = [...sortedData];

      while (filledData.length < 3) {
        filledData.push({
          userId: user.id,
          income_config_day: 25,
          amount: 0,
          memo: '',
          sort: filledData.length,
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

  /**
   * 項目の更新ロジック（数値変換とバリデーションを含む）
   */
  const handleUpdateItem = (
    index: number,
    key: keyof IncomeConfigOutput,
    value: any,
  ) => {
    const newItems = [...items];
    let finalValue = value;

    // 数値が必要なカラム（支給日と金額）の処理
    if (key === 'income_config_day' || key === 'amount') {
      const sanitized = sanitizeNumericInput(String(value));
      finalValue = sanitized === '' ? 0 : parseInt(sanitized, 10);

      // 支給日のバリデーション（0〜31日のみ許容）
      if (key === 'income_config_day') {
        if (finalValue < 0 || finalValue > 31) return;
      }
    }

    newItems[index] = { ...newItems[index], [key]: finalValue };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      const validConfigs: IncomeConfigInput[] = items
        .filter((item) => item.amount > 0)
        .map((item, index) => ({
          userId: user.id,
          income_config_day: item.income_config_day,
          memo: item.memo,
          amount: item.amount,
          sort: index,
        }));

      await IncomeConfigRepository.deleteIncomeConfig(user.id);

      if (validConfigs.length > 0) {
        await IncomeConfigRepository.saveIncomeCongigInput(validConfigs);
      }

      alert('給料設定を保存しました');
      await initData();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SalarySettingPresenter
      items={items}
      loading={loading}
      saving={saving}
      onBack={onBack}
      onUpdateItem={handleUpdateItem}
      onSave={handleSave}
    />
  );
};
