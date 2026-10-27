import type { IdempotencyKey } from "../../../domain/shared/idempotency.ts";
import type { ObjectionId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** WithdrawObjectionUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface WithdrawObjectionInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの UUID 文字列。presentation で必須・形式を検証し、execute で名目型にする。 */
  idempotencyKey: IdempotencyKey;
  /** URL の :objectionId から得る異議 ID。controller で UUID 形式を検証した値である。 */
  objectionId: ObjectionId;
}
