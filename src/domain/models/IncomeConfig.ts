export interface IncomeConfig {
  id?: string;
  userId: string;
  income_config_day: number;
  memo: string;
  amount: number;
}

export interface IncomeConfigFront extends IncomeConfig {
  tempId: string;
}
