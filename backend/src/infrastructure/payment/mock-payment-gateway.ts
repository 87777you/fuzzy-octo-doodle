import type { PaymentGateway } from "../../application/ports/payment-gateway.port.ts";
import type { TaskId, UserId } from "../../domain/shared/ids.ts";

/**
 * 責務: `PaymentGateway` port の MVP 向けモック実装。本物の決済サービスには接続しない。
 * 実装の方針: assertCanCreateTask は常に成功し、requestCharge はログを出すだけにする。
 * 本実装（Stripe）に差し替えるときは、このクラスを置き換え、PersistenceModule の束縛を変える。
 *
 * 全体の流れ: CreateTask が作成前に `assertCanCreateTask` を呼ぶ。ExpireInitialTasks が、失敗の確定をコミットした後に
 * `requestCharge` を呼ぶ（外部 I/O をトランザクションの中に入れないため）。
 */
export class MockPaymentGateway implements PaymentGateway {
  /** タスク作成前の確認。モックは常に成功させる。本実装では、満たさなければ DomainError("PAYMENT_REQUIRED") */
  assertCanCreateTask(_userId: UserId): Promise<void> {
    return Promise.resolve();
  }

  /** 失敗が確定したタスクの請求依頼。モックはログのみ。呼び出し元はコミット後に呼ぶ */
  requestCharge(input: { taskId: TaskId; userId: UserId; amount: number }): Promise<void> {
    console.log(JSON.stringify({ msg: "mock charge requested", ...input }));
    return Promise.resolve();
  }
}
