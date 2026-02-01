import React, { useState } from 'react';
import { format } from 'date-fns';
import type { IncomeInput } from '../../../../domain/models/Income';
import { sanitizeNumericInput } from '../../../../utils/formatters';
import { useAuth } from '../../../state/AuthContext';
import { IncomeRepository } from '../../../../infrastructure/repositories/IncomeRepository';
import { IncomeEntryPresenter } from './IncomeEntryPresenter';

export const IncomeEntryContainer: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [incomeDate, setIncomeDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [saving, setSaving] = useState(false);

  const handleAmountChange = (value: string) => {
    const sanitized = sanitizeNumericInput(value);
    setAmount(sanitized);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!amount || parseInt(amount) <= 0) {
      alert('金額を入力してください');
      return;
    }

    try {
      setSaving(true);

      const incomeData: IncomeInput = {
        userId: user.id,
        amount: parseInt(amount),
        memo: memo,
        income_day: new Date(incomeDate),
      };

      await IncomeRepository.saveIncome(incomeData);

      alert('給料を登録しました！');
      // フォームをクリア
      setAmount('');
      setMemo('');
      setIncomeDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      console.error('給料登録失敗:', error);
      alert(
        '登録に失敗しました: ' + (error instanceof Error ? error.message : ''),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <IncomeEntryPresenter
      amount={amount}
      memo={memo}
      incomeDate={incomeDate}
      saving={saving}
      onAmountChange={handleAmountChange}
      onMemoChange={setMemo}
      onDateChange={setIncomeDate}
      onSave={handleSave}
    />
  );
};
