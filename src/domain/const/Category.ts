/**
 * 以前のCategoryMetadataを、指定の名称と型に変更しました。
 * 追加いただいた「住居費」「投資」「奨学金」などの汎用項目を統合したフルリストです。
 * Record<string, string> 型に合わせて、各カテゴリの表示名（日本語）を定義しています。
 */
export const CATEGORY: Record<string, string> = {
  // --- 食費 ---
  FOOD: '食費',

  // --- 日用品・生活 ---
  LIVING: '日用品費',
  LIVING_PET: 'ペット',

  // --- 交通・移動 ---
  TRANS: '交通費',

  // --- 住宅費 ---
  HOUSE: '住居費',

  // --- 水道光熱費 ---
  UTILITIES: '水道光熱費',

  // --- 通信・スマホ ---
  COMM: '通信費',

  // --- 健康・美容 ---
  HEALTH_MEDICAL: '医療費',
  BEAUTY: '美容費',

  // --- 娯楽・趣味 ---
  ENT_HOBBY: '趣味費',
  ENT_TRAVEL: '旅行',

  // --- 自己研鑽・教育 ---
  EDU_TOTAL: '教育費',

  // --- 衣服・ファッション ---
  FASHION: '被服費',

  // --- 交際費・ギフト ---
  GIFT_SOCIAL: '交際費',

  // --- 特別な支出・固定費・投資 ---
  SPEC_TOTAL: '特別費',
  SPEC_INSURANCE_TOTAL: '保険料',
  SPEC_SCHOLARSHIP: '奨学金',

  // --- その他 ---
  OTHERS: '雑費',
};

export type Category = keyof typeof CATEGORY;
