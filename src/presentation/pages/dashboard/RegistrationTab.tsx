import { CalendarToday } from '@mui/icons-material';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../color.config';
import type { Category } from '../../../domain/models/Category';
import type { Expense } from '../../../domain/models/Expenses';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
import { CategoryInputField } from '../../components/CategoryInputField';
import { PrimaryActionButton } from '../../components/PrimaryActionButton';
import { useAuth } from '../../state/AuthContext';

export const RegistrationTab: React.FC<{ saving?: boolean }> = ({ saving = false }) => {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [baseAmountMap, setBaseAmountMap] = useState<{ [key: string]: number }>({});
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>({});
  const [memoInputs, setMemoInputs] = useState<{ [key: string]: string }>({}); // メモ用State
  const [displayTotalMap, setDisplayTotalMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [savingLocal, setSavingLocal] = useState(false);

  const isSaving = saving || savingLocal;
  const today = new Date();
  const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
  const isoDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [catData, todayTotals] = await Promise.all([
          CategoryRepository.getCategories(user.id),
          ExpensesRepository.getTodayTotals(user.id),
        ]);
        if (isMounted) {
          setCategories(catData);
          setBaseAmountMap(todayTotals || {});
          setDisplayTotalMap(todayTotals || {});
        }
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleAmountChange = (id: string, val: string) => {
    setAmountInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleMemoChange = (id: string, val: string) => {
    setMemoInputs((prev) => ({ ...prev, [id]: val }));
  };

  const handleBlur = (id: string) => {
    const inputValue = parseInt(amountInputs[id] || '0', 10);
    const baseValue = baseAmountMap[id] || 0;
    setDisplayTotalMap((prev) => ({ ...prev, [id]: baseValue + inputValue }));
  };

  const handleSave = async () => {
    if (!user) return;

    // 金額が入っているものだけを抽出してExpenseモデルに変換
    const transactionsToSave: Expense[] = Object.entries(amountInputs)
      .filter(([_, value]) => value !== '' && parseInt(value) > 0)
      .map(([categoryId, value]) => ({
        userId: user.id,
        categoryId: categoryId,
        amount: parseInt(value),
        memo: memoInputs[categoryId] || null, // メモがあれば入れる
        paymentDate: isoDate,
      }));

    if (transactionsToSave.length === 0) {
      alert('入力された金額がありません');
      return;
    }

    try {
      setSavingLocal(true);
      await ExpensesRepository.saveExpenses(transactionsToSave);

      const updatedTotals = await ExpensesRepository.getTodayTotals(user.id);
      setBaseAmountMap(updatedTotals);
      setDisplayTotalMap(updatedTotals);
      setAmountInputs({});
      setMemoInputs({}); // メモもリセット

      alert('記録しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSavingLocal(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: APP_COLORS.white,
          borderRadius: 2,
          boxShadow: `0 2px 8px ${APP_COLORS.lightGray}`,
        }}
      >
        <CalendarToday sx={{ color: APP_COLORS.mainGreen, mr: 1, fontSize: 20 }} />
        <Typography sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          今日の支出を入力: {dateString}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${APP_COLORS.lightGray}`,
          bgcolor: 'white',
        }}
      >
        <Stack spacing={0}>
          {categories.length === 0 && (
            <Typography sx={{ p: 2, textAlign: 'center', color: APP_COLORS.textPrimary }}>
              カテゴリを登録してください
            </Typography>
          )}

          {categories.map((cat) => (
            <CategoryInputField
              key={cat.id}
              label={cat.category_name}
              alreadyPaid={displayTotalMap[cat.id] || 0}
              value={amountInputs[cat.id] || ''}
              memoValue={memoInputs[cat.id] || ''}
              onChange={(val) => handleAmountChange(cat.id, val)}
              onMemoChange={(val) => handleMemoChange(cat.id, val)}
              onBlur={() => handleBlur(cat.id)}
            />
          ))}
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <PrimaryActionButton onClick={handleSave} disabled={isSaving}>
          {isSaving ? '記録中...' : '今日の支出を記録する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
