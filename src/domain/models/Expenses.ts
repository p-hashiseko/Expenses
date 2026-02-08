export interface ExpenseInput {
  userId: string;
  category: string;
  amount: number;
  memo: string | null;
  payment_date: string;
}

export interface ExpenseOutput {
  id: number;
  userId: string;
  category: string;
  amount: number;
  memo: string | null;
  payment_date: string;
}
