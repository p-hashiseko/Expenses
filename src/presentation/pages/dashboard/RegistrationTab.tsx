import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, CircularProgress } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

// 共通設定・コンポーネント
import { APP_COLORS } from '../../../color.config';
import { CategoryInputField } from '../../components/CategoryInputField';
import { PrimaryActionButton } from '../../components/PrimaryActionButton';
import { useAuth } from '../../state/AuthContext';

// リポジトリ・モデル
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import type { Category } from '../../../domain/models/Category';
import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';

export const RegistrationTab: React.FC = () => {
  const { user } = useAuth();

  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [baseAmountMap, setBaseAmountMap] = useState<{ [key: string]: number }>({});
  const [currentInputs, setCurrentInputs] = useState<{ [key: string]: string }>({});
  const [displayTotalMap, setDisplayTotalMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  // --- 初期データ取得 ---
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 並列でデータ取得（どちらかが失敗しても片方は反映する）
        const results = await Promise.allSettled([
          CategoryRepository.getCategories(user.id),
          ExpensesRepository.getTodayTotals(user.id)
        ]);

        const catRes = results[0];
        const totalsRes = results[1];

        let categoryList: Category[] = [];
        let todayTotals: { [key: string]: number } = {};

        if (catRes.status === 'fulfilled') {
          categoryList = catRes.value as Category[];
        } else {
          console.error('カテゴリ取得に失敗しました:', catRes.reason);
        }

        if (totalsRes.status === 'fulfilled') {
          todayTotals = totalsRes.value as { [key: string]: number };
        } else {
          console.error('本日の合計取得に失敗しました:', totalsRes.reason);
        }

        if (isMounted) {
          // 取得に成功した方だけステートを更新
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
    return () => { isMounted = false; };
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
      [id]: baseValue + inputValue
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
      setLoading(true);
      await ExpensesRepository.saveExpenses(transactionsToSave);
      
      // 保存後の再取得
      const updatedTotals = await ExpensesRepository.getTodayTotals(user.id);
      setBaseAmountMap(updatedTotals);
      setDisplayTotalMap(updatedTotals);
      setCurrentInputs({}); 

      alert('記録しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // --- 描画ロジック ---

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: APP_COLORS.white, borderRadius: 2, boxShadow: `0 2px 8px ${APP_COLORS.lightGray}` }}>
        <CalendarToday sx={{ color: APP_COLORS.mainGreen, mr: 1, fontSize: 20 }} />
        <Typography sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>
          今日の支出を入力: {dateString}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${APP_COLORS.lightGray}`, bgcolor: 'white' }}>
        <Stack spacing={0}>
          {/* デバッグ情報（正常に表示されたら削除してください） */}
          {categories.length === 0 && (
             <Typography sx={{ p: 2, textAlign: 'center', color: APP_COLORS.textPrimary }}>
               データは取得されましたが表示対象がありません
             </Typography>
          )}

          {/* デバッグ出力は削除済み */}

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
        <PrimaryActionButton onClick={handleSave} disabled={loading}>
          記録する
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};