import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, IconButton, Stack, Button, CircularProgress 
} from '@mui/material';
import { ArrowBack, DragHandle, Delete } from '@mui/icons-material';

// dnd-kit 関連
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// プロジェクト固有のインポート
import { useAuth } from '../../../state/AuthContext';
import type { Category } from '../../../../domain/models/Category';
import { CategoryRepository } from '../../../../infrastructure/repositories/CategoryRepository';
import { APP_COLORS } from '../../../../color.config';
import { PrimaryActionButton } from '../../../components/PrimaryActionButton';

const TOTAL_ROWS = 15;

// --- 個別の行コンポーネント (SortableItem) ---
interface SortableItemProps {
  id: string;
  index: number;
  row: Partial<Category>;
  onChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  isDragging: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, index, row, onChange, onDelete, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

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
        boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.15)' : 'none',
        borderRadius: isDragging ? 2 : 0,
        transition: 'box-shadow 0.2s, background-color 0.2s',
      }}
    >
      {/* ドラッグハンドル: ここだけでドラッグ可能 */}
      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', mr: 1, p: 0.5 }}>
        <DragHandle sx={{ color: APP_COLORS.lightGray }} />
      </Box>
      
      <Typography sx={{ width: 35, color: APP_COLORS.textPrimary, opacity: 0.3, fontWeight: 'bold', fontSize: 13 }}>
        {String(index + 1).padStart(2, '0')}
      </Typography>

      <TextField
        fullWidth
        variant="standard"
        placeholder="名称未設定"
        value={row.category_name || ''}
        onChange={(e) => onChange(index, e.target.value)}
        InputProps={{ 
          disableUnderline: true, 
          sx: { px: 1, fontSize: 15, color: APP_COLORS.textPrimary, fontWeight: 500 } 
        }}
      />

      {/* 削除ボタン: 名前がある場合のみ表示 */}
      {row.category_name && (
        <IconButton 
          size="small" 
          onClick={() => onDelete(index)}
          sx={{ color: APP_COLORS.error, opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

// --- メインコンポーネント ---
export const CategoriesSetting: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<(Partial<Category> & { tempId: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // センサー設定（クリックとドラッグを判別するために distance を設定）
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchCategories(); }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await CategoryRepository.getCategories(user.id);
      
      const fillRows = data.map(c => ({ ...c, tempId: c.id }));
      while (fillRows.length < TOTAL_ROWS) {
        fillRows.push({ 
          tempId: `empty-${Math.random()}`,
          category_name: '', 
          is_not_count: false 
        } as any);
      }
      setRows(fillRows);
    } catch (e) { console.error('Fetch error:', e); } finally { setLoading(false); }
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex(i => i.tempId === active.id);
        const newIndex = items.findIndex(i => i.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleChange = (index: number, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], category_name: value };
    setRows(newRows);
  };

  const handleDelete = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    // 常に15行を維持するため空行を追加
    newRows.push({
      tempId: `empty-${Math.random()}`,
      category_name: '',
      is_not_count: false
    } as any);
    setRows(newRows);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      // 1. 現在の表示内容から保存用データを作成
      const toSave = rows
        .map((row, index) => ({
          ...(row.id ? { id: row.id } : {}),
          user_id: user.id,
          category_name: row.category_name?.trim() || '',
          sort_order: index,
          is_not_count: row.is_not_count || false
        }))
        .filter(row => row.category_name !== '');

      // 2. 削除チェック: DBにあるのに今回の保存対象から消えたものを探す
      const initialData = await CategoryRepository.getCategories(user.id);
      const toSaveIds = new Set(toSave.map(item => item.id).filter(Boolean));
      const deletedCategories = initialData.filter(item => !toSaveIds.has(item.id));

      if (deletedCategories.length > 0) {
        const deletedNames = deletedCategories.map(c => `・${c.category_name}`).join('\n');
        const confirmMsg = 
          `以下のカテゴリが削除されます。よろしいですか？\n\n${deletedNames}\n\n※このカテゴリに紐づく過去の支出データは「未分類」扱いになります。`;
        
        if (!window.confirm(confirmMsg)) {
          setSaving(false);
          return;
        }
      }

      // 3. 保存実行（ID維持＋並び替え＋削除の一括処理）
      await CategoryRepository.saveCategoriesOrdered(user.id, toSave);
      
      alert('保存しました');
      fetchCategories();
    } catch (e) { 
      console.error('Save error:', e);
      alert('保存に失敗しました'); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10, bgcolor: APP_COLORS.background, height: '100vh' }}>
      <CircularProgress sx={{ color: APP_COLORS.mainGreen }} />
    </Box>
  );

  return (
    <Box sx={{ p: 1, bgcolor: APP_COLORS.background, minHeight: '100vh' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={onBack} sx={{ color: APP_COLORS.textPrimary }}><ArrowBack /></IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: APP_COLORS.textPrimary }}>カテゴリ設定</Typography>
      </Stack>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Paper elevation={0} sx={{ border: `1px solid ${APP_COLORS.lightGray}`, borderRadius: 4, overflow: 'hidden' }}>
          <SortableContext items={rows.map(r => r.tempId)} strategy={verticalListSortingStrategy}>
            <Stack divider={<Box sx={{ borderBottom: `1px solid ${APP_COLORS.lightGray}` }} />}>
              {rows.map((row, index) => (
                <SortableItem 
                  key={row.tempId} 
                  id={row.tempId} 
                  index={index} 
                  row={row} 
                  onChange={handleChange}
                  onDelete={handleDelete}
                  isDragging={activeId === row.tempId}
                />
              ))}
            </Stack>
          </SortableContext>
        </Paper>
      </DndContext>

      <Box sx={{ mt: 4, px: 1, pb: 10 }}>
        <PrimaryActionButton onClick={handleSave} disabled={saving} sx={{ height: 56, borderRadius: 4 }}>
          {saving ? '保存中...' : '変更を保存する'}
        </PrimaryActionButton>
      </Box>
    </Box>
  );
};