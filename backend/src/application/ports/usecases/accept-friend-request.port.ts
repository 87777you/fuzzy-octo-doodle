import type { FriendshipId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** AcceptFriendRequestUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface AcceptFriendRequestInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** URL の :id から得る申請 ID。controller で UUID 形式を検証した値である。 */
  friendshipId: FriendshipId;
}
