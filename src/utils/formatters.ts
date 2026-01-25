import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

/**
 * 入力文字列を半角数字のみに変換し、先頭の不要な0を削除する
 * @param input 対象の文字列
 * @returns 数字のみの半角文字列
 */
export const sanitizeNumericInput = (input: string): string => {
  // 1. 全角数字を半角に変換
  let val = input.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });

  // 2. 数字(0-9)以外のすべての文字を排除
  const rawValue = val.replace(/[^0-9]/g, '');

  // 3. 先頭の連続する0を削除 (例: "00100" -> "100" / "0" はそのまま残す)
  return rawValue === '' ? '' : rawValue.replace(/^0+(?!$)/, '');
};

/**
 * 数値をカンマ区切りの文字列に変換する
 */
export const formatCurrency = (val: string | number): string => {
  if (val === '' || val === null || val === undefined) return '';
  const num = typeof val === 'string' ? Number(val) : val;
  return isNaN(num) ? '' : num.toLocaleString();
};

/**
 * 記入時間(ISOStringなど)を「M/d(E) HH:mm」形式に変換する
 * 例: 2024-01-19T16:10:00 -> 1/19(月) 16:10
 */
export const formatFullDateTime = (date: string | Date | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'M/d(E) HH:mm', { locale: ja });
};

/**
 * 日付を「M/d(E)」形式に変換する
 */
export const formatDateWithDay = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'M/d(E)', { locale: ja });
};
