import type { IdempotencyKey } from "../../../domain/shared/idempotency.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** CreateFriendRequestUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CreateFriendRequestInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの UUID 文字列。presentation で必須・形式を検証し、execute で名目型にする。 */
  idempotencyKey: IdempotencyKey;
  /** 本文の招待 token。文字列として検証済みで、有効性と招待者は FriendInviteRepository で確認する。 */
  inviteToken: string;
}
