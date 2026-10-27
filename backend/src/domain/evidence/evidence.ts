import type { EvidenceId, TaskId } from "../shared/ids.ts";
import type { StoragePath } from "../shared/storage-path.ts";
import type { SubmissionType } from "./upload-session.ts";

/** 写真は 1〜3 枚。タプル型なので 0 枚・4 枚は型で表現できない。配列の位置が display_order（1 始まり） */
export type PhotoPaths =
  | readonly [StoragePath]
  | readonly [StoragePath, StoragePath]
  | readonly [StoragePath, StoragePath, StoragePath];

/** 提出後は編集不可 */
export interface Evidence {
  readonly id: EvidenceId;
  readonly taskId: TaskId;
  readonly submissionType: SubmissionType;
  readonly comment: string | null;
  readonly submittedAt: Date;
  readonly photos: PhotoPaths;
}
