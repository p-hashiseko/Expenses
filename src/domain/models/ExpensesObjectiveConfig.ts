export interface ExpensesObjectiveConfigFront {
  tempId: string;
  id?: string;
  userId: string;
  categoryId: string;
  amount: number | null; // objective_amount
  day: number; // payment_due_date
}
