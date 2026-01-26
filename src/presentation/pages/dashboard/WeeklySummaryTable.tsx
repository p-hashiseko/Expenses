// import { ChevronLeft, ChevronRight } from '@mui/icons-material';
// import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
// import { DataGrid, type GridCellParams, type GridColDef, type GridColumnHeaderParams } from '@mui/x-data-grid';
// import { addDays, eachDayOfInterval, format, isSameDay, startOfWeek, subDays } from 'date-fns';
// import { ja } from 'date-fns/locale';

// import React, { useCallback, useEffect, useMemo, useState } from 'react';

// import { APP_COLORS } from '../../../color.config';
// import { CategoryRepository } from '../../../infrastructure/repositories/CategoryConfigRepository';
// import { ExpensesRepository } from '../../../infrastructure/repositories/ExpensesRepository';
// import { formatDateWithDay } from '../../../utils/formatters';
// import { DetailCategoryCard } from '../../components/DtailCategoryCard';
// import { useAuth } from '../../state/AuthContext';

// export const WeeklySummaryTable: React.FC = () => {
//   const { user } = useAuth();
//   const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
//     startOfWeek(new Date(), { weekStartsOn: 1 })
//   );
//   const [rows, setRows] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [rawExpenses, setRawExpenses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 選択状態の管理
//   const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

//   const weekDays = useMemo(() => {
//     return eachDayOfInterval({
//       start: currentWeekStart,
//       end: addDays(currentWeekStart, 6),
//     });
//   }, [currentWeekStart]);

//   /**
//    * データの取得とテーブル行の生成
//    */
//   const fetchData = useCallback(async () => {
//     if (!user) return;
//     try {
//       setLoading(true);
//       const startDate = format(weekDays[0], 'yyyy-MM-dd');
//       const endDate = format(weekDays[6], 'yyyy-MM-dd');

//       const [catData, expenses] = await Promise.all([
//         CategoryRepository.getCategories(user.id),
//         ExpensesRepository.getExpensesByRange(user.id, startDate, endDate),
//       ]);

//       setCategories(catData || []);
//       setRawExpenses(expenses || []);

//       // テーブル行の生成
//       const tableRows = (catData || []).map((cat) => {
//         const row: any = { id: cat.id, categoryName: cat.category_name };
//         weekDays.forEach((day) => {
//           const dateStr = format(day, 'yyyy-MM-dd');
//           row[dateStr] = (expenses || [])
//             .filter((e) => e.categoryId === cat.id && e.paymentDate === dateStr)
//             .reduce((sum, e) => sum + (e.amount || 0), 0);
//         });
//         row.total = weekDays.reduce((sum, day) => sum + (row[format(day, 'yyyy-MM-dd')] || 0), 0);
//         return row;
//       });

//       // フッター（合計）行の生成
//       const footerTotalRow = {
//         id: 'total-footer',
//         categoryName: '合計',
//         ...weekDays.reduce((acc: any, day) => {
//           const dateStr = format(day, 'yyyy-MM-dd');
//           acc[dateStr] = tableRows.reduce((sum: number, r: any) => sum + (r[dateStr] || 0), 0);
//           return acc;
//         }, {}),
//         total: tableRows.reduce((sum: number, r: any) => sum + r.total, 0),
//       };

//       setRows([...tableRows, footerTotalRow]);

//       // 初回表示かつ未選択の場合、今日の日付をデフォルト表示にする
//       if (!selectedDateStr) {
//         const today = new Date();
//         const todayStr = format(today, 'yyyy-MM-dd');
//         const isTodayInWeek = weekDays.some((day) => isSameDay(day, today));
//         if (isTodayInWeek) {
//           setSelectedDateStr(todayStr);
//         }
//       }
//     } catch (error) {
//       console.error('データ取得失敗:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [user, weekDays, selectedDateStr]);

//   useEffect(() => {
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, currentWeekStart]);

//   const columns: GridColDef[] = [
//     { field: 'categoryName', headerName: 'カテゴリ', width: 110, sortable: false },
//     ...weekDays.map(
//       (day): GridColDef => ({
//         field: format(day, 'yyyy-MM-dd'),
//         headerName: `${format(day, 'd(E)', { locale: ja })}`,
//         flex: 1,
//         minWidth: 70,
//         headerAlign: 'center',
//         align: 'right',
//         sortable: false,
//         valueFormatter: (value: any) => (!value || value === 0 ? '-' : value.toLocaleString()),
//       })
//     ),
//     {
//       field: 'total',
//       headerName: '合計',
//       width: 90,
//       headerAlign: 'center',
//       align: 'right',
//       sortable: false,
//       valueFormatter: (value: any) => (!value || value === 0 ? '-' : value.toLocaleString()),
//     },
//   ];

//   const handleColumnHeaderClick = (params: GridColumnHeaderParams) => {
//     if (params.field === 'categoryName' || params.field === 'total') return;
//     setSelectedDateStr(params.field);
//     setSelectedCategoryId(null);
//   };

//   const handleCellClick = (params: GridCellParams) => {
//     if (params.id === 'total-footer' || params.field === 'categoryName' || params.field === 'total')
//       return;
//     setSelectedDateStr(params.field);
//     setSelectedCategoryId(params.row.id as string);
//   };

//   const dailyDetailsGrouped = useMemo(() => {
//     if (!selectedDateStr) return [];
//     const dailyExpenses = rawExpenses.filter((e) => e.paymentDate === selectedDateStr);

//     return categories
//       .map((cat) => ({
//         id: cat.id,
//         categoryName: cat.category_name,
//         items: dailyExpenses.filter((e) => e.categoryId === cat.id),
//       }))
//       .filter((group) => group.items.length > 0);
//   }, [selectedDateStr, rawExpenses, categories]);

//   return (
//     <Box sx={{ width: '100%', mt: 2 }}>
//       {/* ナビゲーション */}
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
//         <IconButton
//           onClick={() => {
//             setCurrentWeekStart(subDays(currentWeekStart, 7));
//             setSelectedDateStr(null);
//             setSelectedCategoryId(null);
//           }}
//         >
//           <ChevronLeft />
//         </IconButton>
//         <Typography variant="subtitle1" sx={{ color: APP_COLORS.textPrimary, fontWeight: 'bold' }}>
//           {format(weekDays[0], 'M月d日')} ～ {format(weekDays[6], 'M月d日')}
//         </Typography>
//         <IconButton
//           onClick={() => {
//             setCurrentWeekStart(addDays(currentWeekStart, 7));
//             setSelectedDateStr(null);
//             setSelectedCategoryId(null);
//           }}
//         >
//           <ChevronRight />
//         </IconButton>
//       </Box>

//       {/* サマリーテーブル */}
//       <Paper
//         elevation={0}
//         sx={{
//           width: '100%',
//           border: `1px solid ${APP_COLORS.lightGray}`,
//           borderRadius: 3,
//           overflow: 'hidden',
//           bgcolor: APP_COLORS.white,
//           mb: 3,
//         }}
//       >
//         {loading ? (
//           <Box display="flex" justifyContent="center" alignItems="center" py={5}>
//             <CircularProgress sx={{ color: APP_COLORS.mainGreen }} size={30} />
//           </Box>
//         ) : (
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             autoHeight
//             disableColumnMenu
//             hideFooter
//             density="compact"
//             onColumnHeaderClick={handleColumnHeaderClick}
//             onCellClick={handleCellClick}
//             sx={{
//               border: 'none',
//               '& .MuiDataGrid-columnHeader': {
//                 backgroundColor: '#fafafa',
//                 cursor: 'pointer',
//                 '&:hover': { backgroundColor: `${APP_COLORS.mainGreen}10` },
//               },
//               '& .MuiDataGrid-row:not([data-id="total-footer"]) .MuiDataGrid-cell:not([data-field="categoryName"]):not([data-field="total"])':
//                 { cursor: 'pointer', '&:hover': { backgroundColor: `${APP_COLORS.mainGreen}05` } },
//               '& .MuiDataGrid-row[data-id="total-footer"]': {
//                 backgroundColor: `${APP_COLORS.mainGreen}10`,
//                 fontWeight: 'bold',
//               },
//               '& .MuiDataGrid-cell': {
//                 borderColor: APP_COLORS.lightGray,
//                 '&:focus': { outline: 'none' },
//               },
//             }}
//           />
//         )}
//       </Paper>

//       {/* 詳細エリア */}
//       {selectedDateStr && (
//         <Box sx={{ mt: 2 }}>
//           <Typography
//             variant="subtitle1"
//             sx={{ fontWeight: 'bold', mb: 2, color: APP_COLORS.textPrimary, textAlign: 'center' }}
//           >
//             {formatDateWithDay(selectedDateStr)} の詳細データ
//           </Typography>

//           {dailyDetailsGrouped.length > 0 ? (
//             dailyDetailsGrouped.map((group) => (
//               <DetailCategoryCard
//                 key={group.id}
//                 categoryName={group.categoryName}
//                 items={group.items}
//                 isHighlighted={group.id === selectedCategoryId}
//                 onRefresh={fetchData} // 子コンポーネントに更新用関数を渡す
//               />
//             ))
//           ) : (
//             <Paper
//               elevation={0}
//               sx={{
//                 p: 3,
//                 border: `1px solid ${APP_COLORS.lightGray}`,
//                 borderRadius: 3,
//                 textAlign: 'center',
//                 bgcolor: 'white',
//               }}
//             >
//               <Typography variant="body2" sx={{ color: 'gray' }}>
//                 この日の記録はありません
//               </Typography>
//             </Paper>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// };

export const WeeklySummaryTable: React.FC = () => {
  return <div>Weekly Summary Table Content</div>;
};
