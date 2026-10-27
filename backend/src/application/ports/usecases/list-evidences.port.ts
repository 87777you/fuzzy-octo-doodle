import type { SubmissionType } from "../../../domain/evidence/upload-session.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** タスクに紐づく証拠項目の一覧。 */
export interface EvidenceListResult {
  /** 保存済み証拠を EvidenceListItem に変換した一覧。 */
  evidences: readonly EvidenceListItem[];
}

/** 1 回分の初回または追加証拠と、その写真の閲覧 URL。 */
export interface EvidenceListItem {
  /** initial は初回提出、additional は追加提出を表す。 */
  submissionType: SubmissionType;
  /** 証拠を確定した日時。 */
  submittedAt: Date;
  /** 写真ごとの短期署名付き閲覧 URL。認可後に ObjectStorage が発行する。 */
  photoUrls: readonly string[];
}

/** ListEvidencesUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListEvidencesInput {
  /** 認証済みセッションから得た閲覧者 ID。@CurrentUser() で名目型として検証済み。 */
  viewerId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: TaskId;
}

/** 権限を確認した証拠一覧。各写真 URL は短期署名付きで、判定確定後のフレンドには発行しない。 */
export type ListEvidencesOutput = EvidenceListResult;
