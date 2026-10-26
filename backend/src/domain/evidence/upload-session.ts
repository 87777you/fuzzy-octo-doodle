import { DomainError } from "../shared/errors.ts";
import { required } from "../shared/invariant.ts";
import type { TaskId, UploadSessionId, UserId } from "../shared/ids.ts";
import type { Task } from "../task/task.ts";
import { canStartUploadBy, uploadCompleteBy } from "../task/task-policy.ts";

export type SubmissionType = "initial" | "additional";
export type UploadSessionStatus = "uploading" | "completed" | "expired" | "cancelled";

export interface UploadSessionProps {
  id: UploadSessionId;
  taskId: TaskId;
  userId: UserId;
  submissionType: SubmissionType;
  startedAt: Date;
  uploadExpiresAt: Date;
  status: UploadSessionStatus;
  completedAt: Date | null;
}

export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 3;

export class UploadSession {
  private props: UploadSessionProps;
  private constructor(props: UploadSessionProps) {
    this.props = props;
  }

  /** 期限内にアップロード開始を受理した場合のみ作成できる。完了期限は 本来の期限 + 5分 */
  static start(
    id: UploadSessionId,
    task: Task,
    userId: UserId,
    type: SubmissionType,
    now: Date,
  ): UploadSession {
    if (task.ownerId !== userId) throw new DomainError("FORBIDDEN", "本人のタスクのみ証拠を提出できます");

    let baseDeadline: Date;
    if (type === "initial") {
      if (task.status !== "active")
        throw new DomainError("STATE_CONFLICT", "初回証拠を提出できる状態ではありません");
      baseDeadline = task.deadlineAt;
    } else {
      if (task.status !== "disputed")
        throw new DomainError("STATE_CONFLICT", "追加証拠を提出できる状態ではありません");
      baseDeadline = required(task.additionalEvidenceDeadlineAt, "additionalEvidenceDeadlineAt");
    }
    if (!canStartUploadBy(baseDeadline, now))
      throw new DomainError("DEADLINE_EXPIRED", "提出期限を過ぎています");

    return new UploadSession({
      id,
      taskId: task.snapshot().id,
      userId,
      submissionType: type,
      startedAt: now,
      uploadExpiresAt: uploadCompleteBy(baseDeadline),
      status: "uploading",
      completedAt: null,
    });
  }

  static reconstitute(props: UploadSessionProps): UploadSession {
    return new UploadSession({ ...props });
  }

  /** 写真のStorage上のパスはセッション配下に限定する（他人のオブジェクトを流用させない） */
  static pathPrefix(taskId: TaskId, sessionId: UploadSessionId): string {
    return `evidence/${taskId}/${sessionId}/`;
  }

  assertCompletable(userId: UserId, photoPaths: readonly string[], now: Date): void {
    if (this.props.userId !== userId) throw new DomainError("FORBIDDEN", "このセッションは利用できません");
    if (this.props.status !== "uploading")
      throw new DomainError("STATE_CONFLICT", "このアップロードセッションは完了できません");
    if (now.getTime() > this.props.uploadExpiresAt.getTime())
      throw new DomainError("DEADLINE_EXPIRED", "アップロード完了期限を過ぎています");
    if (
      photoPaths.length < MIN_PHOTOS ||
      photoPaths.length > MAX_PHOTOS ||
      new Set(photoPaths).size !== photoPaths.length
    ) {
      throw new DomainError("INVALID_EVIDENCE_COUNT", "証拠写真は1〜3枚で指定してください");
    }
    const prefix = UploadSession.pathPrefix(this.props.taskId, this.props.id);
    if (!photoPaths.every((p) => p.startsWith(prefix))) {
      throw new DomainError("VALIDATION_ERROR", "不正な写真パスが含まれています");
    }
  }

  complete(now: Date): void {
    this.props.status = "completed";
    this.props.completedAt = now;
  }

  /** 完了期限を過ぎた uploading を expired にする（ジョブ用・冪等） */
  expireIfStale(now: Date): boolean {
    if (this.props.status === "uploading" && now.getTime() > this.props.uploadExpiresAt.getTime()) {
      this.props.status = "expired";
      return true;
    }
    return false;
  }

  get id(): UploadSessionId {
    return this.props.id;
  }
  get taskId(): TaskId {
    return this.props.taskId;
  }
  get submissionType(): SubmissionType {
    return this.props.submissionType;
  }
  get uploadExpiresAt(): Date {
    return this.props.uploadExpiresAt;
  }
  snapshot(): Readonly<UploadSessionProps> {
    return { ...this.props };
  }
}
