import type { UserId } from "../../../domain/shared/ids.ts";

/** UpdateMeUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface UpdateMeInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** PATCH body の nickname。Controller が文字列形式を検証し、parseNickname が長さと空文字を検証する。 */
  nickname: string;
}
