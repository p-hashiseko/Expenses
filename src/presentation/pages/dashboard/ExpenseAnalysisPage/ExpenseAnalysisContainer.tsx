import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ExpenseAnalysisPresenter } from './ExpenseAnalysisPresenter';
import { useAuth } from '../../../state/AuthContext';
import { ExpensesRepository } from '../../../../infrastructure/repositories/ExpensesRepository';
import { CategoryConfigRepository } from '../../../../infrastructure/repositories/CategoryConfigRepository';
import { ExpensesObjectiveConfigRepository } from '../../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
import { IncomeRepository } from '../../../../infrastructure/repositories/IncomeRepository';
import { CATEGORY } from '../../../../domain/const/Category';

// カテゴリごとの色を定義
const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#FF8042',
  LIVING: '#0088FE',
  LIVING_PET: '#00C49F',
  TRANS: '#FFBB28',
  HOUSE: '#8884d8',
  UTILITIES: '#82ca9d',
  COMM: '#ffc658',
  HEALTH_MEDICAL: '#ff7300',
  BEAUTY: '#a4de6c',
  ENT_HOBBY: '#d0ed57',
  ENT_TRAVEL: '#8dd1e1',
  EDU_TOTAL: '#83a6ed',
  FASHION: '#8a89a6',
  GIFT_SOCIAL: '#7b4397',
  SPEC_TOTAL: '#c7254e',
  SPEC_INSURANCE_TOTAL: '#5cb85c',
  SPEC_SCHOLARSHIP: '#f0ad4e',
  SPEC_INVESTMENT: '#5bc0de',
  OTHERS: '#999999',
};

export const ExpenseAnalysisContainer: React.FC = () => {
  const { user } = useAuth();
  const lastMonth = dayjs().subtract(1, 'month');
  const [year, setYear] = useState(lastMonth.year());
  const [month, setMonth] = useState(lastMonth.month() + 1);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);

  const months = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 期間の開始日と終了日を計算
        let startDate: string;
        let endDate: string;

        if (viewMode === 'month') {
          startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
          endDate = dayjs(`${year}-${month}-01`)
            .endOf('month')
            .format('YYYY-MM-DD');
        } else {
          // 年モード: 1年間のデータ
          startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
          endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');
        }

        // 並行してデータを取得
        const [
          expenses,
          categoryConfig,
          objectiveConfig,
          totalIncome,
          allExpenses,
          periodIncome,
        ] = await Promise.all([
          ExpensesRepository.getExpensesByPeriod(user.id, startDate, endDate),
          CategoryConfigRepository.getCategoryConfig(user.id),
          ExpensesObjectiveConfigRepository.getConfigs(user.id),
          IncomeRepository.getTotalIncome(user.id),
          ExpensesRepository.getExpenses(user.id), // 全期間の支出
          IncomeRepository.getIncomeByPeriod(user.id, startDate, endDate), // 期間の収入
        ]);

        // 目標金額をカテゴリ別にマップ（年モードの場合は12倍）
        const objectiveMap: Record<string, number> = {};
        objectiveConfig.forEach((config) => {
          const baseAmount = config.objective_amount || 0;
          objectiveMap[config.category] =
            viewMode === 'year' ? baseAmount * 12 : baseAmount;
        });

        // カテゴリ別に支出を集計（選択期間のデータ）
        const categoryTotals: Record<string, number> = {};
        let periodExpenseAmount = 0;
        expenses.forEach((expense) => {
          const cat = expense.category;
          categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount;
          // 投資カテゴリは支出から除外
          if (cat !== 'SPEC_INVESTMENT') {
            periodExpenseAmount += expense.amount;
          }
        });

        // 期間の収支 = 期間の収入 - 期間の支出
        const periodBalance = periodIncome - periodExpenseAmount;

        // 資産計算用：全期間のデータを集計
        let totalExpenseAmount = 0;
        let investmentAmount = 0;

        allExpenses.forEach((expense) => {
          // 投資カテゴリの金額を集計
          if (expense.category === 'SPEC_INVESTMENT') {
            investmentAmount += expense.amount;
          } else {
            // 投資以外を支出に計上
            totalExpenseAmount += expense.amount;
          }
        });

        // 現金 = 収入合計 - 支出合計（全期間）
        const cash = totalIncome - totalExpenseAmount;

        // 総資産 = 現金 + 金融資産（投資）
        const totalAssets = cash + investmentAmount;

        // 月別に支出を集計（年モード用）
        const monthlyTotals: number[] = Array(12).fill(0);
        if (viewMode === 'year') {
          expenses.forEach((expense) => {
            const expenseMonth = dayjs(expense.payment_date).month(); // 0-11
            monthlyTotals[expenseMonth] += expense.amount;
          });
        }

        // カテゴリ設定の順序でカテゴリデータを作成
        const sortedCategories = [...categoryConfig].sort(
          (a, b) => a.sort - b.sort,
        );

        // すべてのカテゴリを表示（金額0でも表示）
        const categories = sortedCategories.map((cat) => ({
          name: CATEGORY[cat.category] || cat.category,
          amount: categoryTotals[cat.category] || 0,
          objective: objectiveMap[cat.category] || 0,
          color: CATEGORY_COLORS[cat.category] || '#999999',
        }));

        setData({
          totalAssets,
          cash,
          investment: investmentAmount,
          categories,
          monthlyTotals,
          periodIncome,
          periodExpense: periodExpenseAmount,
          periodBalance,
        });
      } catch (error) {
        console.error('データ取得失敗:', error);
        setData({
          totalAssets: 0,
          cash: 0,
          investment: 0,
          categories: [],
          monthlyTotals: Array(12).fill(0),
        });
      } finally {
        setLoading(false);
      }
    };

    setData(null); // 切り替え時にデータをリセット
    fetchData();
  }, [user, year, month, viewMode]);

  const totalExpense =
    data?.categories.reduce((sum: number, item: any) => sum + item.amount, 0) ||
    0;

  const barSeriesData = data?.categories.map((c: any) => c.amount) || [];
  const barObjectiveData = data?.categories.map((c: any) => c.objective) || [];
  const categoryLabels = data?.categories.map((c: any) => c.name) || [];

  const pieData =
    data?.categories.map((c: any, index: number) => ({
      id: index,
      value: c.amount,
      label: c.name,
      color: c.color,
    })) || [];

  const monthlyData = data?.monthlyTotals || Array(12).fill(0);

  return (
    <ExpenseAnalysisPresenter
      year={year}
      month={month}
      viewMode={viewMode}
      setYear={setYear}
      setMonth={setMonth}
      setViewMode={setViewMode}
      years={years}
      months={months}
      data={data}
      loading={loading}
      totalExpense={totalExpense}
      barSeriesData={barSeriesData}
      barObjectiveData={barObjectiveData}
      categoryLabels={categoryLabels}
      pieData={pieData}
      monthlyData={monthlyData}
    />
  );
};

export default ExpenseAnalysisContainer;
