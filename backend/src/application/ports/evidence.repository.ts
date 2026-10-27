import type { Evidence } from "../../domain/evidence/evidence.ts";
import type {
  SubmissionType,
  UploadingSession,
  UploadSession,
} from "../../domain/evidence/upload-session.ts";
import type { TaskId, UploadSessionId } from "../../domain/shared/ids.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface EvidenceRepository {
  /** (task_id, submission_type) 一意。違反は DomainError('ALREADY_EXISTS') */
  insert(tx: Tx, evidence: Evidence): Promise<void>;
  listByTask(tx: Tx, taskId: TaskId): Promise<Evidence[]>;
  exists(tx: Tx, taskId: TaskId, type: SubmissionType): Promise<boolean>;
}
export const EVIDENCE_REPOSITORY = Symbol("EvidenceRepository");

export interface UploadSessionRepository {
  insert(tx: Tx, s: UploadingSession): Promise<void>;
  findByIdForUpdate(tx: Tx, id: UploadSessionId): Promise<UploadSession | null>;
  save(tx: Tx, s: UploadSession): Promise<void>;
  /** status=uploading かつ upload_expires_at >= now のセッションが存在するか（期限切れ確定の猶予判定） */
  hasLiveSession(tx: Tx, taskId: TaskId, type: SubmissionType, now: Date): Promise<boolean>;
  /** 完了期限を過ぎた uploading を expired に更新。更新件数を返す */
  expireStale(tx: Tx, now: Date): Promise<number>;
}
export const UPLOAD_SESSION_REPOSITORY = Symbol("UploadSessionRepository");
