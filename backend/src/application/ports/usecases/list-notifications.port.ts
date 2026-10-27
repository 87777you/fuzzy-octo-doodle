import type { UserId } from "../../../domain/shared/ids.ts";

/** ListNotificationsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListNotificationsInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** クエリ filter。Zod で all または unread に検証済みの一覧条件である。 */
  filter: "all" | "unread";
  /** クエリ cursor。未指定なら先頭ページ、指定時は Zod の形式検証後に Repository が位置を復元する。 */
  cursor?: string;
  /** クエリ limit。1ページに含める通知件数であり、Controller が Zod で数値として検証する。 */
  limit: number;
}
