// import { ArrowBack, TrackChanges } from '@mui/icons-material';
// import {
//   Box,
//   CircularProgress,
//   IconButton,
//   Paper,
//   Stack,
//   Typography,
// } from '@mui/material';
// import React, { useEffect, useState } from 'react';
// import { APP_COLORS } from '../../../../color.config';
// import type { Category } from '../../../../domain/const/Category';
// import type { ExpensesObjectiveConfigFront } from '../../../../domain/models/ExpensesObjectiveConfig';
// import { ExpensesObjectiveConfigRepository } from '../../../../infrastructure/repositories/ExpensesObjectiveConfigRepository';
// import { CategoryInputField } from '../../../components/CategoryInputField';
// import { PrimaryActionButton } from '../../../components/PrimaryActionButton';
// import { useAuth } from '../../../state/AuthContext';

// export const ObjectiveSetting: React.FC<{ onBack: () => void }> = ({ onBack }) => {
//   const { user } = useAuth();

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [amountInputs, setAmountInputs] = useState<{ [key: string]: string }>(
//     {},
//   );
//   // 合計金額表示用のステート
//   const [displayTotal, setDisplayTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // 金額の合算ロジック
//   const calculateTotal = (inputs: { [key: string]: string }) => {
//     const total = Object.values(inputs).reduce((sum, val) => {
//       const num = parseInt(val, 10);
//       return sum + (isNaN(num) ? 0 : num);
//     }, 0);
//     setDisplayTotal(total);
//   };

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!user) return;
//       try {
//         setLoading(true);
//         const [catData, configData] = await Promise.all([
//           CategoryRepository.getCategories(user.id),
//           ExpensesObjectiveConfigRepository.getConfigs(user.id),
//         ]);

//         setCategories(catData);

//         const initialInputs: { [key: string]: string } = {};
//         configData.forEach((config) => {
//           if (config.amount !== null) {
//             initialInputs[config.categoryId] = config.amount.toString();
//           }
//         });
//         setAmountInputs(initialInputs);
//         // 初回読み込み時に合計を計算
//         calculateTotal(initialInputs);
//       } catch (error) {
//         console.error('データ取得失敗:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInitialData();
//   }, [user]);

//   const handleAmountChange = (categoryId: string, val: string) => {
//     setAmountInputs((prev) => ({ ...prev, [categoryId]: val }));
//   };

//   // 入力欄からフォーカスが外れた時に合計を再計算
//   const handleBlur = () => {
//     calculateTotal(amountInputs);
//   };

//   const handleSave = async () => {
//     if (!user) return;

//     const configsToSave: ExpensesObjectiveConfigFront[] = categories.map(
//       (cat) => ({
//         tempId: crypto.randomUUID(),
//         userId: user.id,
//         categoryId: cat.id,
//         amount: amountInputs[cat.id]
//           ? parseInt(amountInputs[cat.id], 10)
//           : null,
//         day: 1,
//       }),
//     );

//     try {
//       setSaving(true);
//       await ExpensesObjectiveConfigRepository.saveConfigs(
//         user.id,
//         configsToSave,
//       );
//       alert('目標金額を保存しました！');
//       onBack();
//     } catch (error) {
//       console.error('保存エラー:', error);
//       alert('保存に失敗しました');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         py={10}
//         bgcolor={APP_COLORS.background}
//         minHeight="100vh"
//       >
//         <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
//       {/* ヘッダー */}
//       <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
//         <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}>
//           <ArrowBack />
//         </IconButton>
//         <Typography
//           variant="h6"
//           sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}
//         >
//           月間目標金額の設定
//         </Typography>
//       </Stack>

//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           mb: 3,
//           p: 2,
//           bgcolor: APP_COLORS.white,
//           borderRadius: 2,
//           border: `1px solid ${APP_COLORS.lightGray}50`,
//         }}
//       >
//         <TrackChanges
//           sx={{ color: APP_COLORS.mainGreen, mr: 1, fontSize: 20 }}
//         />
//         <Typography
//           variant="body2"
//           sx={{ color: APP_COLORS.textPrimary, opacity: 0.8 }}
//         >
//           各カテゴリの1ヶ月の予算（目標）を入力してください。
//         </Typography>
//       </Box>

//       <Paper
//         elevation={0}
//         sx={{
//           p: 2,
//           borderRadius: 3,
//           border: `1px solid ${APP_COLORS.lightGray}`,
//           bgcolor: 'white',
//         }}
//       >
//         <Stack spacing={0}>
//           {categories.length === 0 ? (
//             <Typography
//               sx={{ p: 2, textAlign: 'center', color: APP_COLORS.textPrimary }}
//             >
//               カテゴリを登録してください
//             </Typography>
//           ) : (
//             categories.map((cat) => (
//               <CategoryInputField
//                 key={cat.id}
//                 label={cat.category_name}
//                 value={amountInputs[cat.id] || ''}
//                 alreadyPaid={0}
//                 memoValue=""
//                 showMemo={false}
//                 onChange={(val) => handleAmountChange(cat.id, val)}
//                 onMemoChange={() => {}}
//                 onBlur={handleBlur} // ここでフォーカスアウトを検知
//               />
//             ))
//           )}
//         </Stack>
//       </Paper>

//       {/* 合計金額表示 */}
//       <Box
//         sx={{
//           mt: 3,
//           px: 2,
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'baseline',
//         }}
//       >
//         <Typography
//           sx={{
//             fontWeight: 'bold',
//             color: APP_COLORS.textPrimary,
//             fontSize: '0.9rem',
//           }}
//         >
//           目標合計額
//         </Typography>
//         <Typography
//           variant="h5"
//           sx={{ fontWeight: 'bold', color: APP_COLORS.mainGreen }}
//         >
//           ¥ {displayTotal.toLocaleString()}
//         </Typography>
//       </Box>

//       <Box sx={{ mt: 2, pb: 10 }}>
//         <PrimaryActionButton onClick={handleSave} disabled={saving}>
//           {saving ? '保存中...' : '目標を保存する'}
//         </PrimaryActionButton>
//       </Box>
//     </Box>
//   );
// };

export const ObjectiveSetting: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  return <div>Objective Setting Content</div>;
};
