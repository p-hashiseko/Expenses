import React, { useEffect, useState, useRef } from 'react';
import { format, subDays, addDays, eachDayOfInterval } from 'date-fns';
import { ExpenseEntryPresenter } from './ExpenseEntryPresenter';
import type { CategoryConfigOutput } from '../../../../domain/models/CategoryConfig';
import type {
  ExpenseOutput,
  ExpenseInput,
} from '../../../../domain/models/Expenses';
import { CategoryConfigRepository } from '../../../../infrastructure/repositories/CategoryConfigRepository';
import { ExpensesRepository } from '../../../../infrastructure/repositories/ExpensesRepository';
import { sanitizeNumericInput } from '../../../../utils/formatters';
import { useAuth } from '../../../state/AuthContext';

export const ExpenseEntryContainer: React.FC = () => {
  const { user } = useAuth();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const displayDays = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: addDays(new Date(), 1),
  }).map((date) => format(date, 'yyyy-MM-dd'));

  const [categories, setCategories] = useState<CategoryConfigOutput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [editValues, setEditValues] = useState<{
    [category: string]: { amount: string; memo: string };
  }>({});

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [catData, expData] = await Promise.all([
        CategoryConfigRepository.getCategoryConfig(user.id),
        ExpensesRepository.getExpensesByPeriod(
          user.id,
          displayDays[0],
          displayDays[7],
        ),
      ]);

      setCategories(catData);
      setExpenses(expData);
      syncEditValues(expData, selectedDate, catData);

      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollLeft =
            tableContainerRef.current.scrollWidth;
        }
      }, 100);
    } catch (error) {
      console.error('データ取得失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const syncEditValues = (
    currentExpenses: ExpenseOutput[],
    date: string,
    currentCats: CategoryConfigOutput[],
  ) => {
    const newValues: { [category: string]: { amount: string; memo: string } } =
      {};
    currentCats.forEach((cat) => {
      const target = currentExpenses.find(
        (e) => e.payment_date === date && e.category === cat.category,
      );
      newValues[cat.category] = {
        amount: target ? target.amount.toString() : '',
        memo: target ? target.memo || '' : '',
      };
    });
    setEditValues(newValues);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    syncEditValues(expenses, date, categories);
  };

  const handleInputChange = (
    category: string,
    field: 'amount' | 'memo',
    value: string,
  ) => {
    let processedValue = value;
    if (field === 'amount') {
      processedValue = sanitizeNumericInput(value);
    }
    setEditValues((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: processedValue },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      // 要望1: 金額が入力されており、かつ0円より大きいデータのみを抽出
      const configsToSave: ExpenseInput[] = categories
        .map((cat) => {
          const edit = editValues[cat.category];
          const amountNum = parseInt(edit.amount, 10);
          return {
            userId: user.id,
            category: cat.category,
            amount: isNaN(amountNum) ? 0 : amountNum,
            memo: edit.memo || null,
            payment_date: selectedDate,
          };
        })
        .filter((item) => item.amount > 0);

      // 既存のその日のデータを一旦リセットするか、Upsertするロジックが必要ですが、
      // ここではシンプルに「入力があったものだけを保存」します。
      for (const input of configsToSave) {
        await ExpensesRepository.saveExpense(input);
      }

      alert(`${selectedDate} のデータを保存しました`);
      await fetchData();
    } catch (error) {
      console.error('保存失敗:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ExpenseEntryPresenter
      tableContainerRef={tableContainerRef}
      dates={displayDays}
      categories={categories}
      expenses={expenses}
      selectedDate={selectedDate}
      todayStr={todayStr}
      editValues={editValues}
      loading={loading}
      saving={saving}
      onDateSelect={handleDateSelect}
      onInputChange={handleInputChange}
      onSave={handleSave}
    />
  );
};
