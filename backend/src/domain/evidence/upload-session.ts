import { DomainError } from "../shared/errors.ts";
import type { TaskId, UploadSessionId, UserId } from "../shared/ids.ts";
import type { ActiveTask, DisputedTask } from "../task/task.ts";
import { canStartUploadBy, uploadCompleteBy } from "../task/task-policy.ts";
import { parseStoragePath } from "../shared/storage-path.ts";
import type { StoragePath } from "../shared/storage-path.ts";
import type { PhotoPaths } from "./evidence.ts";

export type SubmissionType = "initial" | "additional";

type SessionBase<T extends SubmissionType> = Readonly<{
  id: UploadSessionId;
  taskId: TaskId;
  userId: UserId;
  submissionType: T;
  startedAt: Date;
  uploadExpiresAt: Date;
}>;

type UploadingOf<T extends SubmissionType> = SessionBase<T> & Readonly<{ status: "uploading" }>;
export type UploadingSession<T extends SubmissionType = SubmissionType> = T extends SubmissionType
  ? UploadingOf<T>
  : never;
export type CompletedSession = SessionBase<SubmissionType> &
  Readonly<{ status: "completed"; completedAt: Date }>;
export type ClosedSession = SessionBase<SubmissionType> & Readonly<{ status: "expired" | "cancelled" }>;
export type UploadSession = UploadingSession | CompletedSession | ClosedSession;

/** 写真パスはセッション配下に限定する（他人のオブジェクトを流用させない） */
const photoPathPrefix = (taskId: TaskId, sessionId: UploadSessionId): string => `evidence/${taskId}/${sessionId}/`;

export type PhotoSlot = 1 | 2 | 3;
export type PhotoExtension = "jpg" | "png" | "webp";

/**
 * 写真ごとに発行した、サーバー生成パスとアップロード用 URL の一覧。
 * 「どの枠にどのパスを使うか」は domain の規則（issuePhotoPath）で決まる値なので、use case ではなく domain に置く。
 */
export interface UploadUrlsResult {
  /** 入力の photos と同じ枠ごとのアップロード情報。 */
  uploads: readonly {
    /** 対象写真の枠番号（1〜3）。 */
    slot: PhotoSlot;
    /** 対象セッション配下にサーバーが決めたストレージパス。 */
    path: string;
    /** path へクライアントが直接 PUT するための短期署名付き URL。 */
    uploadUrl: string;
  }[];
}

/** アップロード用の署名 URL を発行するときのパスを、サーバー側で決める。例: evidence/{taskId}/{sessionId}/1.jpg */
export function issuePhotoPath(session: UploadingSession, slot: PhotoSlot, extension: PhotoExtension): StoragePath {
  return parseStoragePath(`${photoPathPrefix(session.taskId, session.id)}${String(slot)}.${extension}`);
}

function start<T extends SubmissionType>(
  id: UploadSessionId,
  task: ActiveTask | DisputedTask,
  userId: UserId,
  type: T,
  baseDeadline: Date,
  now: Date,
): UploadingSession<T> {
  if (task.ownerId !== userId) throw new DomainError("FORBIDDEN", "本人のタスクのみ証拠を提出できます");
  if (!canStartUploadBy(baseDeadline, now))
    throw new DomainError("DEADLINE_EXPIRED", "提出期限を過ぎています");
  const s: UploadingOf<T> = {
    id,
    taskId: task.id,
    userId,
    submissionType: type,
    startedAt: now,
    uploadExpiresAt: uploadCompleteBy(baseDeadline),
    status: "uploading",
  };
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- T で絞り込んだ状態型への変換。T は呼び出し側の型引数で、実行時の値と一致する
  return s as UploadingSession<T>;
}

/** 初回証拠のアップロード開始。期限ちょうどは有効。完了期限は 期限 + 5分 */
export function startInitialUpload(
  id: UploadSessionId,
  task: ActiveTask,
  userId: UserId,
  now: Date,
): UploadingSession<"initial"> {
  return start(id, task, userId, "initial", task.deadlineAt, now);
}

/** 追加証拠のアップロード開始。追加証拠待ち（disputed）のタスクだけを受け付ける */
export function startAdditionalUpload(
  id: UploadSessionId,
  task: DisputedTask,
  userId: UserId,
  now: Date,
): UploadingSession<"additional"> {
  return start(id, task, userId, "additional", task.additionalEvidenceDeadlineAt, now);
}

/** 入力の配列を、ストレージのパスとして検証したうえで 1〜3 枚のタプルに絞り、セッション配下のパスだけを許可する */
export function parsePhotoPaths(session: UploadingSession, paths: readonly string[]): PhotoPaths {
  if (paths.length < 1 || paths.length > 3 || new Set(paths).size !== paths.length) {
    throw new DomainError("INVALID_EVIDENCE_COUNT", "証拠写真は1〜3枚で指定してください");
  }
  const prefix = photoPathPrefix(session.taskId, session.id);
  const [first, second, third] = paths.map(parseStoragePath);
  if (!paths.every((p) => p.startsWith(prefix)) || first === undefined) {
    throw new DomainError("VALIDATION_ERROR", "不正な写真パスが含まれています");
  }
  if (second === undefined) return [first];
  if (third === undefined) return [first, second];
  return [first, second, third];
}

/** 完了。uploading 状態のセッションだけを受け取る */
export function completeUpload(session: UploadingSession, userId: UserId, now: Date): CompletedSession {
  if (session.userId !== userId) throw new DomainError("FORBIDDEN", "このセッションは利用できません");
  if (now.getTime() > session.uploadExpiresAt.getTime()) {
    throw new DomainError("DEADLINE_EXPIRED", "アップロード完了期限を過ぎています");
  }
  return { ...session, status: "completed", completedAt: now };
}

/** 完了期限を過ぎた uploading を expired にする（ジョブ用・冪等）。まだなら null */
export function expireUpload(session: UploadingSession, now: Date): ClosedSession | null {
  if (now.getTime() <= session.uploadExpiresAt.getTime()) return null;
  return { ...session, status: "expired" };
}

export function expectUploading(session: UploadSession): UploadingSession {
  if (session.status !== "uploading") {
    throw new DomainError("STATE_CONFLICT", "このアップロードセッションは完了できません");
  }
  return session;
}
