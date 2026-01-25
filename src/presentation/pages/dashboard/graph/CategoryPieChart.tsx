import { PieChart as PieChartIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

import React from 'react';

import { APP_COLORS } from '../../../../color.config';

interface Props {
  data: { id: number; value: number; label: string; color?: string }[];
}

export const CategoryPieChart: React.FC<Props> = ({ data }) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${APP_COLORS.lightGray}` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <PieChartIcon sx={{ color: APP_COLORS.mainGreen }} />
          <Typography sx={{ fontWeight: 'bold' }}>カテゴリ別割合</Typography>
        </Stack>
        <Box sx={{ width: '100%', height: 350, display: 'flex', justifyContent: 'center' }}>
          <PieChart
            series={[
              {
                data: data,
                innerRadius: 60,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                valueFormatter: (item) => `¥${item.value.toLocaleString()}`,
              },
            ]}
            height={350}
            slotProps={{
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' },
                sx: { p: 0 },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
