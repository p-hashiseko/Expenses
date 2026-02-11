import { Button } from '@mui/material';

import React from 'react';

import { APP_COLORS } from '../../color.config';

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
}>;

export const SecondaryAddButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  startIcon,
}) => (
  <Button
    fullWidth
    variant="text"
    onClick={onClick}
    disabled={disabled}
    startIcon={startIcon}
    sx={{
      color: APP_COLORS.textPrimary,
      fontWeight: 'bold',
      borderRadius: 3, // 少し角を丸く
      height: { xs: 44, sm: 52 }, // モバイルは44px、PCは52px
      fontSize: { xs: '0.85rem', sm: '1rem' }, // モバイルでフォントサイズ調整
      bgcolor: 'transparent',
      textTransform: 'none', // 文字を勝手に大文字にしない
      '&:hover': {
        // マウスオーバー時に薄いグレー背景を出して、クリックできる範囲を教える
        bgcolor: 'rgba(0, 0, 0, 0.05)',
      },
      '&:disabled': {
        color: APP_COLORS.lightGray,
      },
      '& .MuiButton-startIcon': {
        color: 'inherit',
      },
    }}
  >
    {children}
  </Button>
);
