import React, { useEffect, useState, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ExpenseDetailPresenter } from './ExpenseDetailPresenter';
import type { CategoryConfigOutput } from '../../../../domain/models/CategoryConfig';
import type { ExpenseOutput } from '../../../../domain/models/Expenses';
import type { IncomeOutput } from '../../../../domain/models/Income';
import type { InvestmentOutput } from '../../../../domain/models/Investment';
import { CategoryConfigRepository } from '../../../../infrastructure/repositories/CategoryConfigRepository';
import { ExpensesRepository } from '../../../../infrastructure/repositories/ExpensesRepository';
import { IncomeRepository } from '../../../../infrastructure/repositories/IncomeRepository';
import { InvestmentRepository } from '../../../../infrastructure/repositories/InvestmentRepository';
import { useAuth } from '../../../state/AuthContext';

export const ExpenseDetailContainer: React.FC = () => {
  const { user } = useAuth();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [categories, setCategories] = useState<CategoryConfigOutput[]>([]);
  const [expenses, setExpenses] = useState<ExpenseOutput[]>([]);
  const [incomes, setIncomes] = useState<IncomeOutput[]>([]);
  const [investments, setInvestments] = useState<InvestmentOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);

  // 累積残高計算用
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [totalIncomeUpToToday, setTotalIncomeUpToToday] = useState<number>(0);
  const [totalExpensesUpToToday, setTotalExpensesUpToToday] =
    useState<number>(0);

  // ダイアログ関連の状態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

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

      const [
        catData,
        expData,
        incData,
        invData,
        initialBal,
        totalInc,
        totalExp,
      ] = await Promise.all([
        CategoryConfigRepository.getCategoryConfig(user.id),
        ExpensesRepository.getExpensesByPeriod(user.id, startDate, endDate),
        IncomeRepository.getIncomesByPeriod(user.id, startDate, endDate),
        InvestmentRepository.getInvestmentsByPeriod(
          user.id,
          startDate,
          endDate,
        ),
        // 累積残高計算用: 初期所持金
        IncomeRepository.getInitialBalance(user.id),
        // 累積残高計算用: 今日までの全収入（期間の終わりまで）
        IncomeRepository.getIncomeByPeriod(user.id, '1900-01-01', endDate),
        // 累積残高計算用: 今日までの全支出（期間の終わりまで）
        ExpensesRepository.getExpensesByPeriod(
          user.id,
          '1900-01-01',
          endDate,
        ).then((expenses) =>
          expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        ),
      ]);

      setCategories(catData);
      setExpenses(expData);
      setIncomes(incData);
      setInvestments(invData);
      setInitialBalance(initialBal);
      setTotalIncomeUpToToday(totalInc);
      setTotalExpensesUpToToday(totalExp);

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

  // セルクリック処理
  const handleCellClick = (category: string, date: string) => {
    setSelectedCategory(category);
    setSelectedDate(date);
    setDialogOpen(true);
  };

  // ダイアログを閉じる
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCategory('');
    setSelectedDate('');
  };

  // 支出を追加
  const handleExpenseAdd = async (amount: number, memo: string) => {
    if (!user) return;

    try {
      await ExpensesRepository.saveExpense({
        userId: user.id,
        category: selectedCategory,
        amount,
        memo: memo || null,
        payment_date: selectedDate,
      });

      // データを再取得
      await fetchData();

      // ダイアログを閉じない（続けて入力できるように）
      // 必要に応じて閉じる場合は handleDialogClose() を呼ぶ
    } catch (error) {
      console.error('支出の保存に失敗:', error);
      alert('支出の保存に失敗しました');
    }
  };

  // 支出を更新
  const handleExpenseUpdate = async (
    id: number,
    amount: number,
    memo: string,
  ) => {
    try {
      await ExpensesRepository.updateExpense(id, {
        amount,
        memo: memo || null,
      });

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('支出の更新に失敗:', error);
      alert('支出の更新に失敗しました');
    }
  };

  // 支出を削除
  const handleExpenseDelete = async (id: number) => {
    try {
      await ExpensesRepository.deleteExpense(id);

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('支出の削除に失敗:', error);
      alert('支出の削除に失敗しました');
    }
  };

  // 収入を追加
  const handleIncomeAdd = async (amount: number, memo: string) => {
    if (!user) return;

    try {
      await IncomeRepository.saveIncome({
        userId: user.id,
        amount,
        memo: memo || null,
        income_day: selectedDate,
      });

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('収入の保存に失敗:', error);
      alert('収入の保存に失敗しました');
    }
  };

  // 収入を更新
  const handleIncomeUpdate = async (
    id: number,
    amount: number,
    memo: string,
  ) => {
    try {
      await IncomeRepository.updateIncome(id, amount, memo || null);

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('収入の更新に失敗:', error);
      alert('収入の更新に失敗しました');
    }
  };

  // 収入を削除
  const handleIncomeDelete = async (id: number) => {
    try {
      await IncomeRepository.deleteIncome(id);

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('収入の削除に失敗:', error);
      alert('収入の削除に失敗しました');
    }
  };

  // 投資を追加
  const handleInvestmentAdd = async (
    amount: number,
    memo: string,
    flow: 'in' | 'out',
  ) => {
    if (!user) return;

    // 投資額を減らす場合、現在の投資額より高い金額は減らせない
    if (flow === 'out') {
      const currentInvestmentTotal = investments.reduce((total, inv) => {
        if (inv.flow === 'in') return total + inv.amount;
        else return total - inv.amount;
      }, 0);

      if (amount > currentInvestmentTotal) {
        alert(
          `投資額がマイナスになります。現在の投資額: ${currentInvestmentTotal.toLocaleString()}円`,
        );
        return;
      }
    }

    try {
      await InvestmentRepository.createInvestment({
        userId: user.id,
        amount,
        flow,
        memo: memo || null,
        invest_day: selectedDate,
      });

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('投資の保存に失敗:', error);
      alert('投資の保存に失敗しました');
    }
  };

  // 投資を更新
  const handleInvestmentUpdate = async (
    id: number,
    amount: number,
    memo: string,
    flow: 'in' | 'out',
  ) => {
    // 投資額を減らす場合、現在の投資額より高い金額は減らせない
    if (flow === 'out') {
      // 編集対象を除いた投資額を計算
      const currentInvestmentTotal = investments
        .filter((inv) => inv.id !== id)
        .reduce((total, inv) => {
          if (inv.flow === 'in') return total + inv.amount;
          else return total - inv.amount;
        }, 0);

      if (amount > currentInvestmentTotal) {
        alert(
          `投資額がマイナスになります。現在の投資額: ${currentInvestmentTotal.toLocaleString()}円`,
        );
        return;
      }
    }

    try {
      await InvestmentRepository.updateInvestment(
        id,
        amount,
        flow,
        memo || null,
      );

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('投資の更新に失敗:', error);
      alert('投資の更新に失敗しました');
    }
  };

  // 投資を削除
  const handleInvestmentDelete = async (id: number) => {
    try {
      await InvestmentRepository.deleteInvestment(id);

      // データを再取得
      await fetchData();
    } catch (error) {
      console.error('投資の削除に失敗:', error);
      alert('投資の削除に失敗しました');
    }
  };

  // 月の選択肢
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <ExpenseDetailPresenter
      tableContainerRef={tableContainerRef}
      dates={displayDays}
      categories={categories}
      expenses={expenses}
      incomes={incomes}
      investments={investments}
      todayStr={todayStr}
      loading={loading}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      years={years}
      months={months}
      onYearChange={handleYearChange}
      onMonthChange={handleMonthChange}
      dialogOpen={dialogOpen}
      selectedCategory={selectedCategory}
      selectedDate={selectedDate}
      onCellClick={handleCellClick}
      onDialogClose={handleDialogClose}
      onExpenseAdd={handleExpenseAdd}
      onExpenseUpdate={handleExpenseUpdate}
      onExpenseDelete={handleExpenseDelete}
      onIncomeAdd={handleIncomeAdd}
      onIncomeUpdate={handleIncomeUpdate}
      onIncomeDelete={handleIncomeDelete}
      onInvestmentAdd={handleInvestmentAdd}
      onInvestmentUpdate={handleInvestmentUpdate}
      onInvestmentDelete={handleInvestmentDelete}
      initialBalance={initialBalance}
      totalIncomeUpToToday={totalIncomeUpToToday}
      totalExpensesUpToToday={totalExpensesUpToToday}
    />
  );
};
