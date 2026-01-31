// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Stack,
//   Divider,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from '@mui/material';
// import { BarChart, PieChart } from '@mui/x-charts';

// import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
// import { CategoryConfigRepository } from '../../../infrastructure/repositories/CategoryConfigRepository';
// import { APP_COLORS } from '../../../color.config';
// import { CATEGORY, type Category } from '../../../domain/const/Category';
// import { useAuth } from '../../state/AuthContext';

// /* =====================
//    Utils
// ===================== */
// const getLastDayOfMonth = (year: number, month: number) =>
//   new Date(year, month, 0).getDate();

// /* =====================
//    Component
// ===================== */
// export const ExpenseAnalysisPage: React.FC = () => {
//   const { user } = useAuth();
//   const userId = user?.id;

//   const YEARS = [2025, 2026, 2027];
//   const MONTHS = [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec',
//   ];

//   const today = new Date();
//   const [year, setYear] = useState(today.getFullYear());
//   const [monthIndex, setMonthIndex] = useState(today.getMonth());

//   const [expenses, setExpenses] = useState<any[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);

//   /* =====================
//      Fetch Category Config
//   ===================== */
//   useEffect(() => {
//     if (!userId) return;

//     const fetchCategories = async () => {
//       const data = await CategoryConfigRepository.getCategoryConfig(userId);
//       const sorted = [...data].sort((a, b) => a.sort - b.sort);
//       setCategories(sorted.map((c) => c.category as Category));
//     };

//     fetchCategories();
//   }, [userId]);

//   /* =====================
//      Fetch Expenses
//   ===================== */
//   useEffect(() => {
//     if (!userId) return;

//     const fetchExpenses = async () => {
//       const start = new Date(year, monthIndex, 1).toISOString();
//       const lastDay = getLastDayOfMonth(year, monthIndex + 1);
//       const end = new Date(year, monthIndex, lastDay, 23, 59, 59).toISOString();

//       const data = await ExpensesRepository.getExpensesByPeriod(
//         userId,
//         start,
//         end,
//       );

//       setExpenses(data);
//     };

//     fetchExpenses();
//   }, [userId, year, monthIndex]);

//   /* =====================
//      Derived Data
//   ===================== */
//   const lastDay = getLastDayOfMonth(year, monthIndex + 1);
//   const days = Array.from({ length: lastDay }, (_, i) => i + 1);

//   /* --- カテゴリ別 月合計（棒グラフ用） --- */
//   const categoryTotals = useMemo(() => {
//     const map: Record<Category, number> = {} as Record<Category, number>;
//     categories.forEach((c) => (map[c] = 0));

//     expenses.forEach((e) => {
//       const cat = e.category as Category;
//       if (map[cat] !== undefined) map[cat] += e.amount;
//     });

//     return categories.map((c) => ({
//       category: CATEGORY[c] ?? c,
//       value: map[c],
//     }));
//   }, [expenses, categories]);

//   /* --- Pie Chart --- */
//   const pieData = useMemo(() => {
//     return categoryTotals.map((c, idx) => ({
//       id: idx,
//       label: c.category,
//       value: c.value,
//     }));
//   }, [categoryTotals]);

//   /* --- Monthly Grid --- */
//   const gridData = useMemo(() => {
//     const map: Record<Category, number[]> = {} as Record<Category, number[]>;
//     categories.forEach((c) => (map[c] = Array(lastDay).fill(0)));

//     expenses.forEach((e) => {
//       const day = new Date(e.payment_date).getDate();
//       const cat = e.category as Category;
//       if (map[cat]) map[cat][day - 1] += e.amount;
//     });

//     return map;
//   }, [expenses, categories, lastDay]);

//   /* =====================
//      Render
//   ===================== */
//   return (
//     <Box sx={{ p: 3, bgcolor: APP_COLORS.background }}>
//       {/* ===== Header ===== */}
//       <Stack direction="row" justifyContent="flex-end" mb={3}>
//         <Paper sx={{ p: 2 }}>
//           <Stack spacing={1}>
//             <Stack direction="row" spacing={2}>
//               <Typography fontWeight="bold">Year</Typography>
//               {YEARS.map((y) => (
//                 <Typography
//                   key={y}
//                   sx={{
//                     cursor: 'pointer',
//                     borderBottom:
//                       y === year ? `2px solid ${APP_COLORS.mainGreen}` : 'none',
//                   }}
//                   onClick={() => setYear(y)}
//                 >
//                   {y}
//                 </Typography>
//               ))}
//             </Stack>

//             <Stack direction="row" spacing={1}>
//               <Typography fontWeight="bold">Month</Typography>
//               {MONTHS.map((m, i) => (
//                 <Typography
//                   key={m}
//                   sx={{
//                     cursor: 'pointer',
//                     borderBottom:
//                       i === monthIndex
//                         ? `2px solid ${APP_COLORS.mainGreen}`
//                         : 'none',
//                   }}
//                   onClick={() => setMonthIndex(i)}
//                 >
//                   {m}
//                 </Typography>
//               ))}
//             </Stack>
//           </Stack>
//         </Paper>
//       </Stack>

//       {/* ===== Analysis ===== */}
//       <Paper sx={{ p: 3 }}>
//         <Stack direction="row" spacing={4} alignItems="flex-start">
//           {/* --- Category Bar Chart --- */}
//           <Box sx={{ width: '60%' }}>
//             <Typography fontWeight="bold" mb={1}>
//               カテゴリ別 月間支出
//             </Typography>
//             <BarChart
//               layout="horizontal"
//               yAxis={[
//                 {
//                   scaleType: 'band',
//                   data: categoryTotals.map((c) => c.category),
//                 },
//               ]}
//               series={[
//                 {
//                   data: categoryTotals.map((c) => c.value),
//                   color: APP_COLORS.mainGreen,
//                 },
//               ]}
//               height={Math.max(categoryTotals.length * 35, 200)} // 最低高さ200
//             />
//           </Box>

//           {/* --- Pie Chart --- */}
//           <Box sx={{ width: 240 }}>
//             <Typography fontWeight="bold" mb={1}>
//               支出構成
//             </Typography>
//             <PieChart
//               series={[
//                 {
//                   data: pieData,
//                   innerRadius: 50,
//                   outerRadius: 90,
//                 },
//               ]}
//               height={240}
//             />
//           </Box>
//         </Stack>

//         <Divider sx={{ my: 4 }} />

//         {/* ===== Monthly Table ===== */}
//         <Typography fontWeight="bold" mb={2}>
//           月間支出
//         </Typography>

//         <Box sx={{ overflowX: 'auto' }}>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell sx={{ minWidth: 160 }}>カテゴリ</TableCell>
//                 {days.map((d) => (
//                   <TableCell key={d} align="center" sx={{ minWidth: 64 }}>
//                     {d}日
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               {categories.map((cat) => (
//                 <TableRow key={cat}>
//                   <TableCell sx={{ fontWeight: 'bold' }}>
//                     {CATEGORY[cat] ?? cat}
//                   </TableCell>
//                   {gridData[cat].map((v, i) => (
//                     <TableCell key={i} align="center">
//                       {v ? `¥${v.toLocaleString()}` : '–'}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };
