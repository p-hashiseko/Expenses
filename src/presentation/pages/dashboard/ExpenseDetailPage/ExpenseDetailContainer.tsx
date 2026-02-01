import React, { useEffect, useState, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ExpenseDetailPresenter } from './ExpenseDetailPresenter';
import type { CategoryConfigOutput } from '../../../../domain/models/CategoryConfig';
import type { ExpenseOutput } from '../../../../domain/models/Expenses';
import { CategoryConfigRepository } from '../../../../infrastructure/repositories/CategoryConfigRepository';
import { ExpensesRepository } from '../../../../infrastructure/repositories/ExpensesRepository';
import { useAuth } from '../../../state/AuthContext';

export const ExpenseDetailContainer: React.FC = () => {
  const { user } = useAuth();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [categories, setCategories] = useState<CategoryConfigOutput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);

  // 年リストを初期化
  useEffect(() => {
    const initYears = async () => {
      if (!user) return;

      try {
        const oldestYear = await ExpensesRepository.getOldestExpenseYear(
          user.id,
        );
        const currentYear = new Date().getFullYear();

        if (oldestYear === null) {
          // データがない場合は現在の年のみ
          setYears([currentYear]);
        } else {
          // 最古の年から現在の年までの配列を生成
          const yearList = Array.from(
            { length: currentYear - oldestYear + 1 },
            (_, i) => oldestYear + i,
          );
          setYears(yearList);
        }
      } catch (error) {
        console.error('年リストの取得失敗:', error);
        // エラー時は現在の年のみ
        setYears([new Date().getFullYear()]);
      }
    };

    initYears();
  }, [user]);

  // 選択した年月の日付リストを生成
  const getDisplayDays = () => {
    const targetDate = new Date(selectedYear, selectedMonth - 1, 1);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return eachDayOfInterval({ start, end }).map((date) =>
      format(date, 'yyyy-MM-dd'),
    );
  };

  const displayDays = getDisplayDays();
  const todayStr = format(today, 'yyyy-MM-dd');

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const startDate = displayDays[0];
      const endDate = displayDays[displayDays.length - 1];

      const [catData, expData] = await Promise.all([
        CategoryConfigRepository.getCategoryConfig(user.id),
        ExpensesRepository.getExpensesByPeriod(user.id, startDate, endDate),
      ]);

      setCategories(catData);
      setExpenses(expData);

      // 今日の列にスクロール
      setTimeout(() => {
        if (tableContainerRef.current) {
          const todayIndex = displayDays.indexOf(todayStr);
          if (todayIndex >= 0) {
            const cellWidth = 70; // 各セルの大体の幅
            const scrollPosition = Math.max(0, todayIndex * cellWidth - 200);
            tableContainerRef.current.scrollLeft = scrollPosition;
          }
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
  }, [user, selectedYear, selectedMonth]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  // 月の選択肢
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <ExpenseDetailPresenter
      tableContainerRef={tableContainerRef}
      dates={displayDays}
      categories={categories}
      expenses={expenses}
      todayStr={todayStr}
      loading={loading}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      years={years}
      months={months}
      onYearChange={handleYearChange}
      onMonthChange={handleMonthChange}
    />
  );
};
