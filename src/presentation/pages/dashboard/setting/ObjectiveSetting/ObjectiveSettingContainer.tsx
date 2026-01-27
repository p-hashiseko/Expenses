import React, { useEffect, useState } from 'react';
import type { CategoryConfigOutput } from '../../../../../domain/models/CategoryConfig';
import type {
  ExpensesObjectiveConfigInput,
  ExpensesObjectiveConfigOutput,
} from '../../../../../domain/models/ExpensesObjectiveConfig';
import { CategoryConfigRepository } from '../../../../../infrastructure/repositories/CategoryConfigRepository';
import { ExpensesObjectiveConfigRepository } from '../../../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
import { useAuth } from '../../../../state/AuthContext';
import { ObjectiveSettingPresenter } from './ObjectiveSettingPresenter';

export const ObjectiveSettingContainer: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { user } = useAuth();

  const [categories, setCategories] = useState<CategoryConfigOutput[]>([]);
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>(
    {},
  );
  const [displayTotal, setDisplayTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const calculateTotal = (inputs: { [key: string]: string }) => {
    const total = Object.values(inputs).reduce((sum, val) => {
      const num = parseInt(val, 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    setDisplayTotal(total);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [catData, configData] = await Promise.all([
          CategoryConfigRepository.getCategoryConfig(user.id),
          ExpensesObjectiveConfigRepository.getConfigs(user.id),
        ]);

        setCategories(catData);

        const initialInputs: { [key: string]: string } = {};
        configData.forEach((config: ExpensesObjectiveConfigOutput) => {
          if (config.objective_amount !== null) {
            initialInputs[config.category] = config.objective_amount.toString();
          }
        });
        setAmountInputs(initialInputs);
        calculateTotal(initialInputs);
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user]);

  const handleAmountChange = (categoryId: string, val: string) => {
    const newInputs = { ...amountInputs, [categoryId]: val };
    setAmountInputs(newInputs);
  };

  const handleBlur = () => {
    calculateTotal(amountInputs);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const configsToSave: ExpensesObjectiveConfigInput[] = categories
        .map((cat) => {
          const val = amountInputs[cat.category];
          const amount = val ? parseInt(val, 10) : 0;
          return {
            userId: user.id,
            category: cat.category,
            objective_amount: amount,
            payment_due_date: 1,
          };
        })
        .filter((item) => (item.objective_amount ?? 0) > 0);

      // 既存設定の全削除
      await ExpensesObjectiveConfigRepository.deleteConfigs(user.id);

      // 一括保存
      if (configsToSave.length > 0) {
        await ExpensesObjectiveConfigRepository.saveConfigs(configsToSave);
      }

      alert('目標金額を更新しました');
      // onBack(); // 画面を戻さないようにコメントアウト（または削除）
    } catch (error: any) {
      console.error('保存フロー失敗:', error);
      alert(`保存に失敗しました: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ObjectiveSettingPresenter
      categories={categories}
      amountInputs={amountInputs}
      displayTotal={displayTotal}
      loading={loading}
      saving={saving}
      onBack={onBack}
      onAmountChange={handleAmountChange}
      onBlur={handleBlur}
      onSave={handleSave}
    />
  );
};
