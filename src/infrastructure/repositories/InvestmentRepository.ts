import { supabase } from '../supabase/client';
import type {
  InvestmentInput,
  InvestmentOutput,
} from '../../domain/models/Investment';

export class InvestmentRepository {
  /**
   * 投資レコードを作成
   */
  static async createInvestment(
    input: InvestmentInput,
  ): Promise<InvestmentOutput> {
    const { data, error } = await supabase
      .from('investment')
      .insert([
        {
          user_id: input.userId,
          amount: input.amount,
          flow: input.flow,
          memo: input.memo,
          invest_day: input.invest_day,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`投資レコードの作成に失敗: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      flow: data.flow,
      memo: data.memo,
      invest_day: data.invest_day,
      created_at: data.created_at,
    };
  }

  /**
   * ユーザーの全投資レコードを取得
   */
  static async getInvestmentsByUser(
    userId: string,
  ): Promise<InvestmentOutput[]> {
    const { data, error } = await supabase
      .from('investment')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`投資レコードの取得に失敗: ${error.message}`);
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      flow: row.flow,
      memo: row.memo,
      invest_day: row.invest_day,
      created_at: row.created_at,
    }));
  }

  /**
   * 期間を指定して投資レコードを取得
   */
  static async getInvestmentsByPeriod(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<InvestmentOutput[]> {
    const { data, error } = await supabase
      .from('investment')
      .select('*')
      .eq('user_id', userId)
      .gte('invest_day', startDate)
      .lte('invest_day', endDate)
      .order('invest_day', { ascending: false });

    if (error) {
      throw new Error(`期間指定の投資レコード取得に失敗: ${error.message}`);
    }

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      flow: row.flow,
      memo: row.memo,
      invest_day: row.invest_day,
      created_at: row.created_at,
    }));
  }

  /**
   * 投資レコードを更新
   */
  static async updateInvestment(
    id: number,
    amount: number,
    flow: 'in' | 'out',
    memo: string | null,
  ): Promise<InvestmentOutput> {
    const { data, error } = await supabase
      .from('investment')
      .update({
        amount,
        flow,
        memo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`投資レコードの更新に失敗: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      flow: data.flow,
      memo: data.memo,
      invest_day: data.invest_day,
      created_at: data.created_at,
    };
  }

  /**
   * 投資レコードを削除
   */
  static async deleteInvestment(id: number): Promise<void> {
    const { error } = await supabase.from('investment').delete().eq('id', id);

    if (error) {
      throw new Error(`投資レコードの削除に失敗: ${error.message}`);
    }
  }

  /**
   * 投資の合計金額を計算（in - out）
   */
  static async calculateInvestmentTotal(userId: string): Promise<number> {
    const investments = await this.getInvestmentsByUser(userId);

    return investments.reduce((total, investment) => {
      if (investment.flow === 'in') {
        return total + investment.amount;
      } else {
        return total - investment.amount;
      }
    }, 0);
  }
}
