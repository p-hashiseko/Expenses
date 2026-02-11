import { Button } from '@mui/material';

import React from 'react';

import { APP_COLORS } from '../../color.config';

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  // 今後、ボタン内でくるくる回るアイコンを出したい時のために拡張性を持たせておく
  loading?: boolean;
}>;

export const PrimaryActionButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  loading = false, // loadingプロパティを追加（任意）
}) => (
  <Button
    fullWidth
    variant="contained"
    onClick={onClick}
    // loading中もクリックできないようにする
    disabled={disabled || loading}
    sx={{
      // containedを指定している場合、bgcolorは通常 .Mui-disabled で上書きされますが
      // sxで直接書く場合は明示的に制御するとより確実です
      bgcolor: APP_COLORS.mainGreen,
      color: APP_COLORS.white,
      fontWeight: 'bold',
      boxShadow: 'none',
      borderRadius: 4,
      height: { xs: 48, sm: 56 }, // モバイルは48px、PCは56px
      fontSize: { xs: '0.9rem', sm: '1rem' }, // モバイルでフォントサイズ調整
      '& svg': {
        color: 'inherit',
      },
      '&:hover': {
        bgcolor: APP_COLORS.darkGreen,
        boxShadow: 'none',
      },
      // disabled時のスタイルをより明確に
      '&.Mui-disabled': {
        bgcolor: APP_COLORS.lightGray,
        color: APP_COLORS.textPrimary,
        opacity: 0.7,
      },
    }}
  >
    {children}
  </Button>
);
