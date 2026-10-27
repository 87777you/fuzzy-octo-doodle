import type { UserId } from "../../../domain/shared/ids.ts";

/** 未読通知数を返す API の本文。 */
export interface UnreadCount {
  /** 認証利用者本人の未読通知数。0件の場合も0を返す。 */
  count: number;
}

/** CountUnreadNotificationsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CountUnreadNotificationsInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
}
