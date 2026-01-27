import type { Category } from '../const/Category';

export interface FixedCostsConfigInput {
  userId: string;
  memo: string;
  category: Category;
  amount: number | null;
  paymentDate: number;
  sort: number;
}

export interface FixedCostsConfigOutput {
  userId: string;
  memo: string;
  category: Category;
  amount: number | null;
  paymentDate: number;
  sort: number;
}
