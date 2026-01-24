import React from 'react';
import { Button } from '@mui/material';
import { APP_COLORS } from '../../color.config';

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  sx?: any;
}>;

export const PrimaryActionButton: React.FC<Props> = ({ children, onClick, disabled = false, sx }) => (
  <Button
    fullWidth
    variant="contained"
    onClick={onClick}
    disabled={disabled}
    sx={{
      bgcolor: APP_COLORS.mainGreen,
      color: APP_COLORS.white,
      '&, & *': {
        color: APP_COLORS.white,
      },
      '& svg': {
        color: APP_COLORS.white,
      },
      fontWeight: 'bold',
      borderRadius: '12px',
      height: '56px',
      '&:hover': { bgcolor: APP_COLORS.darkGreen },
      ...sx,
    }}
  >
    {children}
  </Button>
);
