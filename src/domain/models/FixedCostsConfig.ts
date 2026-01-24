export interface FixedCostsConfigFront {
  tempId: string; // クライアント側での一意識別用
  id?: string; // DBのUUID
  userId: string;
  categoryId: string;
  memo: string;
  amount: number | null; // 固定費は数値、変動費はnull
  paymentDate: number; // 支給日・支払日（1〜31）
}
