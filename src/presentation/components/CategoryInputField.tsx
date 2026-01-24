import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { APP_COLORS } from '../../color.config';

interface CategoryInputFieldProps {
  label: string;
  value: string;         // 現在入力中の値（カンマなしの文字列）
  alreadyPaid: number;   // すでに入力済みの合計金額
  onChange: (rawVal: string) => void; // 入力値が変更された時のコールバック
  onBlur?: () => void;   // フォーカスが外れた時のコールバック
}

export const CategoryInputField: React.FC<CategoryInputFieldProps> = ({ 
  label, 
  value, 
  alreadyPaid,
  onChange,
  onBlur
}) => {
  
  /**
   * 入力値のバリデーションと整形
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 表示用のカンマを除去
    const rawValue = e.target.value.replace(/,/g, '');
    
    // 空文字を許可しつつ、数値以外が入らないようにチェック
    if (rawValue !== "" && !/^[0-9]+$/.test(rawValue)) return;
    
    onChange(rawValue);
  };

  /**
   * 数値を 1,234 形式の文字列に変換
   */
  const formatDisplayValue = (val: string) => {
    if (!val || val === "") return "";
    return Number(val).toLocaleString();
  };

  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: `1px solid ${APP_COLORS.lightGray}50`,
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.01)', // 軽くホバー感を出して操作性を向上
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {/* 左側：カテゴリ情報エリア */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 'bold',
              color: APP_COLORS.textPrimary,
              fontSize: '1rem',
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontSize: '12px',
              color: APP_COLORS.darkGreen,
              fontWeight: '500',
              mt: 0.5,
            }}
          >
            合計: {alreadyPaid.toLocaleString()}円
          </Typography>
        </Box>

        {/* 右側：入力エリア */}
        <TextField
          variant="standard"
          placeholder="追加"
          value={formatDisplayValue(value)}
          onChange={handleTextChange}
          onBlur={onBlur} // フォーカスが外れた時に合計処理を実行
          sx={{
            width: '110px',
            '& .MuiInput-underline:after': {
              borderBottomColor: APP_COLORS.mainGreen,
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: APP_COLORS.lightGray,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography sx={{ color: APP_COLORS.textPrimary, fontSize: '14px' }}>円</Typography>
              </InputAdornment>
            ),
            inputMode: 'numeric', // スマホで数字キーボードを表示
            inputProps: {
              style: {
                textAlign: 'right',
                fontWeight: 'bold',
                color: APP_COLORS.textPrimary,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};