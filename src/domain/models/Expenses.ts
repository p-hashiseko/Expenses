export interface Expense {
  id?: string;
  userId: string;
  categoryId: string;
  amount: number;
  memo: string | null;
  paymentDate: string;
}
