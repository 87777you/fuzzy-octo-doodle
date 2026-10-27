import type { IdempotencyKey } from "../../../domain/shared/idempotency.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UploadSessionId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** CompleteEvidenceUploadUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CompleteEvidenceUploadInput {
  /** 認証済みセッションから得た提出者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの値。存在はコントローラで確認し、UUID 形式は parseIdempotencyKey で検証する。 */
  idempotencyKey: IdempotencyKey;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: TaskId;
  /** URL の :sessionId パス値。コントローラが UUID 形式を検証し UploadSessionId に変換して渡す。 */
  sessionId: UploadSessionId;
  /** リクエスト本文の写真パス一覧。各パスの安全性・件数・セッション配下かは parsePhotoPaths が検証する。 */
  photoPaths: readonly string[];
}

/**
 * 証拠提出後の本人向けタスク表示。型の実体は domain の OwnerTaskView で、ここは use case の出力として名前を付ける別名のみ
 * （全 use case で `<Name>Output` を揃え、controller が参照する入口にするため。型を重複定義していない）。
 * 成功レスポンスとして冪等性記録にも保存する。
 */
export type CompleteEvidenceUploadOutput = OwnerTaskView;
