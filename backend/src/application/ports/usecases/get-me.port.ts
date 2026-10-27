import type { UserId } from "../../../domain/shared/ids.ts";

/** GetMeUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetMeInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
}
