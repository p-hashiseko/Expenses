export interface ExpensesObjectiveConfigInput {
  userId: string;
  category: string;
  objective_amount: number | null;
  payment_due_date: number;
}

export interface ExpensesObjectiveConfigOutput {
  category: string;
  objective_amount: number | null;
  payment_due_date: number;
}
