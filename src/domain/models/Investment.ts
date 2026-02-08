export type InvestmentFlow = 'in' | 'out';

export interface InvestmentInput {
  userId: string;
  amount: number;
  flow: InvestmentFlow;
  memo: string | null;
  invest_day: string;
}

export interface InvestmentOutput {
  id: number;
  userId: string;
  amount: number;
  flow: InvestmentFlow;
  memo: string | null;
  invest_day: string;
  created_at: string;
}
