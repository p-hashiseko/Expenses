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

  // 新規入力専用
  const [editValues, setEditValues] = useState<{
    [category: string]: { amount: string; memo: string };
  }>({});

  const createEmptyEditValues = (cats: CategoryConfigOutput[]) => {
    const empty: typeof editValues = {};
    cats.forEach((cat) => {
      empty[cat.category] = { amount: '', memo: '' };
    });
    return empty;
  };

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

      // 初回 or 再取得時は「空フォーム」
      setEditValues(createEmptyEditValues(catData));

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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // 日付を変えたら常に新規入力
    setEditValues(createEmptyEditValues(categories));
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

      const inputs: ExpenseInput[] = Object.entries(editValues)
        .map(([category, value]) => {
          const amount = parseInt(value.amount, 10);
          if (!amount || amount <= 0) return null;

          return {
            userId: user.id,
            category,
            amount,
            memo: value.memo || null,
            payment_date: selectedDate,
          };
        })
        .filter(Boolean) as ExpenseInput[];

      for (const input of inputs) {
        await ExpensesRepository.saveExpense(input);
      }

      // 表・合計を更新
      await fetchData();

      // 入力欄は次の追加用に空
      setEditValues(createEmptyEditValues(categories));
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
