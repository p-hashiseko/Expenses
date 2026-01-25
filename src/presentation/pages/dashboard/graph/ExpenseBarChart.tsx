import { BarChart as BarChartIcon } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

import React from 'react';

import { APP_COLORS } from '../../../../color.config';

interface Props {
  data: { label: string; value: number }[];
  title: string;
}

export const ExpenseBarChart: React.FC<Props> = ({ data, title }) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${APP_COLORS.lightGray}` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <BarChartIcon sx={{ color: APP_COLORS.mainGreen }} />
          <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Stack>
        <Box sx={{ width: '100%', height: 250 }}>
          <BarChart
            series={[
              {
                data: data.map((d) => d.value),
                color: APP_COLORS.mainGreen,
                valueFormatter: (v) => `¥${v?.toLocaleString()}`,
              },
            ]}
            xAxis={[{ data: data.map((d) => d.label), scaleType: 'band' }]}
            height={250}
            margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
