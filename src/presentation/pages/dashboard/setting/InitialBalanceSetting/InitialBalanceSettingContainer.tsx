import React, { useEffect, useState } from 'react';
import { IncomeRepository } from '../../../../../infrastructure/repositories/IncomeRepository';
import { useAuth } from '../../../../state/AuthContext';
import { sanitizeNumericInput } from '../../../../../utils/formatters';
import { InitialBalanceSettingPresenter } from './InitialBalanceSettingPresenter';

interface InitialBalanceSettingContainerProps {
  onBack: () => void;
}

export const InitialBalanceSettingContainer: React.FC<
  InitialBalanceSettingContainerProps
> = ({ onBack }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInitialBalance = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await IncomeRepository.getIncomes(user.id);
        // income_dayがnullのレコードを初期所持金として扱う
        const initialBalanceRecord = data.find(
          (item) => item.income_day === null,
        );
        if (initialBalanceRecord) {
          setAmount(initialBalanceRecord.amount);
        }
      } catch (e) {
        console.error('初期所持金の取得に失敗しました:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialBalance();
  }, [user]);

  const handleAmountChange = (value: string) => {
    const sanitized = sanitizeNumericInput(value);
    setAmount(sanitized === '' ? 0 : parseInt(sanitized, 10));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      // 既存の初期所持金レコードを削除
      await IncomeRepository.deleteInitialBalance(user.id);

      // 新しい初期所持金を保存（金額が0より大きい場合のみ）
      if (amount > 0) {
        await IncomeRepository.saveInitialBalance(user.id, amount);
      }

      alert('保存しました');
      onBack();
    } catch (e) {
      console.error('保存に失敗しました:', e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <InitialBalanceSettingPresenter
      amount={amount}
      loading={loading}
      saving={saving}
      onBack={onBack}
      onAmountChange={handleAmountChange}
      onSave={handleSave}
    />
  );
};
