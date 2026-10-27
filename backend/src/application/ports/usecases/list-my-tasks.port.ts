import type { TaskStatus } from "../../../domain/task/task-status.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** ListMyTasksUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListMyTasksInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** クエリ文字列 view。active は進行中、history は終了済みの一覧で、コントローラが許可値を検証済み。 */
  view: "active" | "history";
  /** 任意の status クエリ。TaskStatus の許可値に一致することをコントローラで検証済み。 */
  status?: TaskStatus;
  /** 任意の search クエリ。タスク名の部分一致条件として使う文字列で、クエリ型を検証済み。 */
  search?: string;
  /** 任意の cursor クエリ。前ページの nextCursor をそのまま渡す不透明なページ位置である。 */
  cursor?: string;
  /** クエリ limit。返却件数の上限を表す整数で、許容範囲をコントローラで検証済み。 */
  limit: number;
}
