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
