import type { IdempotencyKey } from "../../../domain/shared/idempotency.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** CreateTaskUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CreateTaskInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの値。存在はコントローラで確認し、UUID 形式は parseIdempotencyKey で検証する。 */
  idempotencyKey: IdempotencyKey;
  /** リクエスト本文のタスク名。本文の形式を検証済みで、文字数と前後空白は parseTaskTitle が処理する。 */
  title: string;
  /** リクエスト本文の達成条件。本文の形式を検証済みで、空でないことは parseNonEmptyText が処理する。 */
  achievementCondition: string;
  /** リクエスト本文の証拠提出方法。本文の形式を検証済みで、空でないことは parseNonEmptyText が処理する。 */
  evidenceMethod: string;
  /** リクエスト本文の期限。ISO 日時を Date に変換済みで、作成時点からの範囲は parseTaskDeadline が検証する。 */
  deadlineAt: Date;
  /** リクエスト本文のペナルティ額。単位は円で、整数かつ許容範囲かを parsePenaltyAmount が検証する。 */
  penaltyAmount: number;
  /** リクエスト本文の公開設定。JSON の真偽値としてコントローラで検証済み。 */
  isPenaltyPublic: boolean;
  /** リクエスト本文の再挑戦元タスク ID。新規作成では null、指定時は UUID 形式を検証し TaskId に変換する。 */
  originalTaskId: TaskId | null;
}

/** 作成したタスクの本人向け表示データ。コントローラが HTTP 201 の本文として返す。 */
export type CreateTaskOutput = OwnerTaskView;
