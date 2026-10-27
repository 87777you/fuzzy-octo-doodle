import type { PostId } from "../../../domain/shared/ids.ts";
import type { ReactionType } from "../../../domain/feed/post.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** SetReactionUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface SetReactionInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** /api/posts/:id/reaction の path parameter。Controller が Zod で ID 形式を検証した文字列である。 */
  postId: PostId;
  /** リクエスト body の type。Controller が Zod で ReactionType のいずれかに検証する。 */
  type: ReactionType;
}
