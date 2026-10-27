import type { UserId } from "../../../domain/shared/ids.ts";

/** ListMyObjectionsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListMyObjectionsInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** クエリのページ位置を示すカーソル。controller で文字列として検証済みで、省略時は先頭ページである。 */
  cursor?: string;
  /** クエリの取得件数。controller で許容範囲を検証済みの整数である。 */
  limit: number;
}
