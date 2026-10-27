import type { TaskId, UserId } from "../../domain/shared/ids.ts";

/** MVP は Mock 実装（ログのみ）。本実装（Stripe）は後で差し替える */
export interface PaymentGateway {
  /** タスク作成前の「支払い方法登録済み・未払いなし」確認。満たさなければ DomainError('PAYMENT_REQUIRED') */
  assertCanCreateTask(userId: UserId): Promise<void>;
  /** 初回未提出で failed になったときの請求依頼。Tx コミット後に呼ぶこと（外部I/Oを Tx 内に入れない） */
  requestCharge(input: { taskId: TaskId; userId: UserId; amount: number }): Promise<void>;
}
export const PAYMENT_GATEWAY = Symbol("PaymentGateway");
