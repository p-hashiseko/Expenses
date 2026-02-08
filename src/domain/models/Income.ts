export type IncomeInput = {
  userId: string;
  amount: number;
  memo: string | null;
  income_day: string;
};

export type IncomeOutput = {
  id: number;
  userId: string;
  amount: number;
  memo: string | null;
  income_day: string;
};
