import { CalendarToday } from '@mui/icons-material';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

// 共通設定・コンポーネント
import { APP_COLORS } from '../../../color.config';
import type { Category } from '../../../domain/models/Category';
// リポジトリ・モデル
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
import { CategoryInputField } from '../../components/CategoryInputField';
import { PrimaryActionButton } from '../../components/PrimaryActionButton';
import { useAuth } from '../../state/AuthContext';

export const RegistrationTab: React.FC<{ saving?: boolean }> = ({ saving = false }) => {
  const { user } = useAuth();

  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [baseAmountMap, setBaseAmountMap] = useState<{ [key: string]: number }>({});
  const [currentInputs, setCurrentInputs] = useState<{ [key: string]: string }>({});
  const [displayTotalMap, setDisplayTotalMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [savingLocal, setSavingLocal] = useState(false);

  // 外部からの saving もしくは ローカルの savingLocal のいずれかが true なら保存中とみなす
  const isSaving = saving || savingLocal;

  const today = new Date();
  const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  // --- 初期データ取得 ---
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const results = await Promise.allSettled([
          CategoryRepository.getCategories(user.id),
          ExpensesRepository.getTodayTotals(user.id),
        ]);

        const catRes = results[0];
        const totalsRes = results[1];

        let categoryList: Category[] = [];
        let todayTotals: { [key: string]: number } = {};

        if (catRes.status === 'fulfilled') {
          categoryList = catRes.value as Category[];
        }

        if (totalsRes.status === 'fulfilled') {
          todayTotals = totalsRes.value as { [key: string]: number };
        }

        if (isMounted) {
          setCategories(categoryList);
          setBaseAmountMap(todayTotals || {});
          setDisplayTotalMap(todayTotals || {});
        }
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // --- イベントハンドラ ---

  const handleInputChange = (id: string, rawVal: string) => {
    setCurrentInputs((prev) => ({ ...prev, [id]: rawVal }));
  };

  const handleBlur = (id: string) => {
    const inputValue = parseInt(currentInputs[id] || '0', 10);
    const baseValue = baseAmountMap[id] || 0;

    setDisplayTotalMap((prev) => ({
      ...prev,
      [id]: baseValue + inputValue,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    const transactionsToSave = Object.entries(currentInputs)
      .filter(([_, value]) => value !== '' && parseInt(value) > 0)
      .map(([categoryId, value]) => ({
        user_id: user.id,
        category_id: categoryId,
        amount: parseInt(value),
      }));

    if (transactionsToSave.length === 0) {
      alert('入力された金額がありません');
      return;
    }

    try {
      setSavingLocal(true); // 保存開始
      await ExpensesRepository.saveExpenses(transactionsToSave);

      const updatedTotals = await ExpensesRepository.getTodayTotals(user.id);
      setBaseAmountMap(updatedTotals);
      setDisplayTotalMap(updatedTotals);
      setCurrentInputs({});

      alert('記録しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSavingLocal(false); // 保存終了
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
              データは取得されましたが表示対象がありません
            </Typography>
          )}

          {categories.map((cat) => (
            <CategoryInputField
              key={cat.id}
              label={cat.category_name}
              alreadyPaid={displayTotalMap[cat.id] || 0}
              value={currentInputs[cat.id] || ''}
              onChange={(rawVal) => handleInputChange(cat.id, rawVal)}
              onBlur={() => handleBlur(cat.id)}
            />
          ))}
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        {/* isSaving に基づいてボタンの状態とテキストを切り替え */}
        <PrimaryActionButton onClick={handleSave} disabled={isSaving}>
          {isSaving ? '記録中...' : '今日の支出を記録する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};
