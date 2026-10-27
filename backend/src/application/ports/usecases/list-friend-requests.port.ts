import type { UserId } from "../../../domain/shared/ids.ts";

/** ListFriendRequestsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListFriendRequestsInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** クエリの direction。controller で incoming または outgoing の二択に検証済みである。 */
  direction: "incoming" | "outgoing";
}
