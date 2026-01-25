import { CalendarToday, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, InputAdornment, Paper, Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';

import React, { useEffect, useState } from 'react';

import { APP_COLORS } from '../../../color.config';
import type { Category } from '../../../domain/models/Category';
import type { Expense } from '../../../domain/models/Expenses';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
import { CategoryInputField } from '../../components/CategoryInputField';
import { PrimaryActionButton } from '../../components/PrimaryActionButton';
import { useAuth } from '../../state/AuthContext';

export const RegistrationTab: React.FC<{ initialDate?: Date; saving?: boolean }> = ({
  initialDate,
  saving = false,
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [baseAmountMap, setBaseAmountMap] = useState<{ [key: string]: number }>({});
  const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>({});
  const [memoInputs, setMemoInputs] = useState<{ [key: string]: string }>({});
  const [displayTotalMap, setDisplayTotalMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [savingLocal, setSavingLocal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const isSaving = saving || savingLocal;

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const handlePrevDay = () => {
    if (selectedDate) setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    if (selectedDate) setSelectedDate(addDays(selectedDate, 1));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user || !selectedDate) return;
      try {
        setLoading(true);
        const isoDate = format(selectedDate, 'yyyy-MM-dd');
        const [catData, dayTotals] = await Promise.all([
          CategoryRepository.getCategories(user.id),
          ExpensesRepository.getTodayTotals(user.id, isoDate),
        ]);

        if (isMounted) {
          setCategories(catData);
          setBaseAmountMap(dayTotals || {});
          setDisplayTotalMap(dayTotals || {});
          setAmountInputs({});
          setMemoInputs({});
        }
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user, selectedDate]);

  const handleSave = async () => {
    if (!user || !selectedDate) return;
    const isoDate = format(selectedDate, 'yyyy-MM-dd');
    const transactionsToSave: Expense[] = Object.entries(amountInputs)
      .filter(([_, value]) => value !== '' && parseInt(value, 10) > 0)
      .map(([categoryId, value]) => ({
        userId: user.id,
        categoryId: categoryId,
        amount: parseInt(value, 10),
        memo: memoInputs[categoryId] || null,
        paymentDate: isoDate,
      }));

    if (transactionsToSave.length === 0) {
      alert('入力された金額がありません');
      return;
    }

    try {
      setSavingLocal(true);
      await ExpensesRepository.saveExpenses(transactionsToSave);
      const updatedTotals = await ExpensesRepository.getTodayTotals(user.id, isoDate);
      setBaseAmountMap(updatedTotals);
      setDisplayTotalMap(updatedTotals);
      setAmountInputs({});
      setMemoInputs({});
      alert('記録しました！');
    } catch (error) {
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, gap: 1 }}
        >
          <IconButton onClick={handlePrevDay} sx={{ color: APP_COLORS.mainGreen }}>
            <ChevronLeft />
          </IconButton>
          <DatePicker
            open={isCalendarOpen}
            onOpen={() => setIsCalendarOpen(true)}
            onClose={() => setIsCalendarOpen(false)}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            format="yyyy/MM/dd"
            slots={{ openPickerIcon: () => null }}
            slotProps={{
              textField: {
                onClick: () => setIsCalendarOpen(true),
                variant: 'outlined',
                size: 'small',
                InputProps: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarToday
                        sx={{ fontSize: 18, color: APP_COLORS.mainGreen, cursor: 'pointer' }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    cursor: 'pointer',
                    borderRadius: '12px',
                    bgcolor: 'white',
                    fontWeight: 'bold',
                    width: '180px',
                    '& fieldset': { borderColor: APP_COLORS.lightGray },
                    '&:hover fieldset': { borderColor: APP_COLORS.mainGreen },
                  },
                },
                sx: {
                  '& .MuiInputBase-input': {
                    textAlign: 'center',
                    cursor: 'pointer',
                    color: APP_COLORS.textPrimary,
                  },
                },
              },
            }}
          />
          <IconButton onClick={handleNextDay} sx={{ color: APP_COLORS.mainGreen }}>
            <ChevronRight />
          </IconButton>
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
            {categories.map((cat) => (
              <CategoryInputField
                key={cat.id}
                label={cat.category_name}
                alreadyPaid={displayTotalMap[cat.id] || 0}
                value={amountInputs[cat.id] || ''}
                memoValue={memoInputs[cat.id] || ''}
                onChange={(val) => setAmountInputs((prev) => ({ ...prev, [cat.id]: val }))}
                onMemoChange={(val) => setMemoInputs((prev) => ({ ...prev, [cat.id]: val }))}
                onBlur={() => {
                  const val = parseInt(amountInputs[cat.id] || '0', 10);
                  setDisplayTotalMap((prev) => ({
                    ...prev,
                    [cat.id]: (baseAmountMap[cat.id] || 0) + val,
                  }));
                }}
              />
            ))}
          </Stack>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <PrimaryActionButton onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? '記録中...'
              : `${selectedDate ? format(selectedDate, 'M/d') : ''} の支出を記録する`}
          </PrimaryActionButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
