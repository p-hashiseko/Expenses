import { Box, InputAdornment, InputBase, TextField, Typography } from '@mui/material';

import React from 'react';

import { APP_COLORS } from '../../color.config';
import { formatCurrency, sanitizeNumericInput } from '../../uitls/formatters';

// 先ほど作成した関数をインポート（パスは環境に合わせて調整してください）

interface CategoryInputFieldProps {
  label: string;
  value: string;
  memoValue: string;
  alreadyPaid: number;
  onChange: (rawVal: string) => void;
  onMemoChange: (val: string) => void;
  onBlur?: () => void;
}

export const CategoryInputField: React.FC<CategoryInputFieldProps> = ({
  label,
  value,
  memoValue,
  alreadyPaid,
  onChange,
  onMemoChange,
  onBlur,
}) => {
  // 共通関数を呼び出す
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumericInput(e.target.value);
    onChange(sanitized);
  };

  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: `1px solid ${APP_COLORS.lightGray}50`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* 1. カテゴリ情報 */}
      <Box sx={{ width: '85px', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary, fontSize: '0.9rem' }}>
          {label}
        </Typography>
        {alreadyPaid > 0 && (
          <Typography
            sx={{ fontSize: '11px', color: APP_COLORS.mainGreen, fontWeight: '500', mt: 0.2 }}
          >
            計 {alreadyPaid.toLocaleString()}
          </Typography>
        )}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* 2. 金額入力 */}
      <TextField
        variant="standard"
        placeholder="0"
        value={formatCurrency(value)} // 共通関数を使用
        onChange={handleTextChange}
        onBlur={onBlur}
        sx={{
          width: '90px',
          flexShrink: 0,
          '& .MuiInput-underline:after': { borderBottomColor: APP_COLORS.mainGreen },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="body2" sx={{ color: APP_COLORS.textPrimary }}>
                円
              </Typography>
            </InputAdornment>
          ),
          inputMode: 'numeric',
          inputProps: {
            style: { textAlign: 'right', fontSize: '1rem', fontWeight: '400' },
          },
        }}
      />

      {/* 3. メモ入力 */}
      <InputBase
        placeholder="メモ"
        value={memoValue}
        onChange={(e) => onMemoChange(e.target.value)}
        sx={{
          width: '120px',
          fontSize: '0.85rem',
          bgcolor: 'rgba(0,0,0,0.03)',
          px: 1,
          py: 0.4,
          borderRadius: 1,
          color: APP_COLORS.textPrimary,
          ml: 1.5,
          fontWeight: '400',
        }}
      />
    </Box>
  );
};
