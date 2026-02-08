import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Typography, IconButton } from '@mui/material';
import { DragHandle, Delete } from '@mui/icons-material';
import { APP_COLORS } from '../../../../../../color.config';

interface SortableCategoryItemProps {
  id: string;
  name: string;
  index: number;
  onDelete: (id: string) => void;
  isDragging: boolean;
}

export const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({
  id,
  name,
  index,
  onDelete,
  isDragging,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        bgcolor: APP_COLORS.white,
        borderBottom: `1px solid ${APP_COLORS.lightGray}`,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', display: 'flex', mr: 2, p: 0.5 }}
      >
        <DragHandle sx={{ color: APP_COLORS.lightGray }} />
      </Box>
      <Typography
        sx={{
          width: 30,
          color: APP_COLORS.textPrimary,
          opacity: 0.5,
          fontSize: 13,
        }}
      >
        {index + 1}
      </Typography>
      <Typography sx={{ flexGrow: 1, fontSize: 15, fontWeight: 500 }}>
        {name}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onDelete(id)}
        sx={{ color: APP_COLORS.error, opacity: 0.6 }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
};
