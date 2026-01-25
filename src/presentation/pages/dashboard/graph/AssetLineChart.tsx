import { History } from '@mui/icons-material';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

import React from 'react';

import { APP_COLORS } from '../../../../color.config';

interface Props {
  data: { month: string; cash: number; total: number }[];
}

export const AssetLineChart: React.FC<Props> = ({ data }) => {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 4, mb: 4, border: `1px solid ${APP_COLORS.lightGray}` }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <History sx={{ color: APP_COLORS.mainGreen }} />
          <Typography sx={{ fontWeight: 'bold' }}>資産推移 (毎月1日時点)</Typography>
        </Stack>
        <Box sx={{ width: '100%', height: 280 }}>
          <LineChart
            xAxis={[{ scaleType: 'point', data: data.map((d) => d.month) }]}
            series={[
              {
                data: data.map((d) => d.cash),
                label: '現金',
                color: '#82ca9d',
                valueFormatter: (v) => `¥${v?.toLocaleString()}`,
              },
              {
                data: data.map((d) => d.total),
                label: '合計資産',
                color: APP_COLORS.mainGreen,
                valueFormatter: (v) => `¥${v?.toLocaleString()}`,
              },
            ]}
            height={280}
            margin={{ top: 20, bottom: 40, left: 60, right: 20 }}
            slotProps={{
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
