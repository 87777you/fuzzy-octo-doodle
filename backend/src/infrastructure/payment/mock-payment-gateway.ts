import { todo } from "../../application/shared/todo.ts";
import type { PaymentGateway } from "../../application/ports/payment-gateway.port.ts";
import type { TaskId, UserId } from "../../domain/shared/ids.ts";

/**
 * MVP のモック実装。実装の方針: assertCanCreateTask は常に成功、requestCharge はログを出すだけ。
 * 本実装（Stripe）に差し替えるときは、このクラスを置き換える。
 */
export class MockPaymentGateway implements PaymentGateway {
  assertCanCreateTask(_userId: UserId): Promise<void> {
    return todo("MockPaymentGateway.assertCanCreateTask");
  }

  requestCharge(_input: { taskId: TaskId; userId: UserId; amount: number }): Promise<void> {
    return todo("MockPaymentGateway.requestCharge");
  }
}
