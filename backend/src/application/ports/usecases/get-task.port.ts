import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** GetTaskUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetTaskInput {
  /** 認証済みセッションから得た閲覧者 ID。@CurrentUser() で名目型として検証済み。 */
  viewerId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: TaskId;
}
