export interface ExpenseInput {
  userId: string;
  category: string;
  amount: number;
  memo: string | null;
  payment_date: string;
}

export interface ExpenseOutput {
  userId: string;
  category: string;
  amount: number;
  memo: string | null;
  payment_date: string;
}
