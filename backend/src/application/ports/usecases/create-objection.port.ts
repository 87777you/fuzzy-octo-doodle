import type { IdempotencyKey } from "../../../domain/shared/idempotency.ts";
import type { ReasonType } from "../../../domain/objection/objection.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** CreateObjectionUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CreateObjectionInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの UUID 文字列。presentation で必須・形式を検証し、execute で名目型にする。 */
  idempotencyKey: IdempotencyKey;
  /** URL の :id から得る対象タスク ID。controller で UUID 形式を検証した値である。 */
  taskId: TaskId;
  /** 本文の異議理由区分。controller で ReasonType の候補に含まれることを検証済みである。 */
  reasonType: ReasonType;
  /** 本文の異議理由。文字列として検証済みだが、空白だけでないことは createObjection が検証する。 */
  reasonDetail: string;
}
