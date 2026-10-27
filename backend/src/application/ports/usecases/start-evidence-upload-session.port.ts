import type { SubmissionType } from "../../../domain/evidence/upload-session.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** StartEvidenceUploadSessionUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface StartEvidenceUploadSessionInput {
  /** 認証済みセッションから得た提出者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: TaskId;
  /** リクエスト本文の提出種別。initial または additional の許可値をコントローラで検証済み。 */
  submissionType: SubmissionType;
}
