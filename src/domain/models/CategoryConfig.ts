import type { Category } from '../const/Category';

export type CategoryConfig = {
  id: string;
  user_id: string;
  category: Category;
  sort: number;
  is_investment: boolean;
  is_advanced_payment: boolean;
};

export type CategoryConfigOutput = {
  category: Category;
  sort: number;
};

export type CategoryConfigInput = {
  category: Category;
  sort: number;
};
