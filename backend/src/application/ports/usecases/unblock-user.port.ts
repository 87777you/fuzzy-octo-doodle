import type { UserId } from "../../../domain/shared/ids.ts";

/** UnblockUserUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface UnblockUserInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** URL の :userId から得るブロック対象 ID。controller で UUID 形式を検証した値である。 */
  targetUserId: UserId;
}
