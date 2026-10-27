import type { PostId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** RemoveReactionUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface RemoveReactionInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** /api/posts/:id/reaction の path parameter。Controller が Zod で ID 形式を検証した文字列である。 */
  postId: PostId;
}
