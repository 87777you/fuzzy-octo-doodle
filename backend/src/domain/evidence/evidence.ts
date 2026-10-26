import type { EvidenceId, TaskId } from "../shared/ids.ts";
import type { SubmissionType } from "./upload-session.ts";

/** 提出後は編集不可。写真は display_order 1..3 */
export interface Evidence {
  readonly id: EvidenceId;
  readonly taskId: TaskId;
  readonly submissionType: SubmissionType;
  readonly comment: string | null;
  readonly submittedAt: Date;
  readonly photos: readonly { readonly storagePath: string; readonly displayOrder: 1 | 2 | 3 }[];
}
