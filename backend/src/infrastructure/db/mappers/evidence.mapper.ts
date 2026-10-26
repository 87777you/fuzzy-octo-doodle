import type { Evidence, PhotoPaths } from "../../../domain/evidence/evidence.ts";
import type { CompletedSession, UploadSession } from "../../../domain/evidence/upload-session.ts";
import type { EvidencePhotosTable, EvidenceUploadSessionsTable, Row, TaskEvidencesTable } from "../schema.ts";
import { CorruptRowError, nonNull, oneOf } from "./common.ts";
import { evidenceId, taskId, uploadSessionId, userId } from "./ids.ts";

const SUBMISSION_TYPES = ["initial", "additional"] as const;

/** display_order 昇順の配列から 1〜3 要素のタプルを作る */
function toPhotoPaths(paths: string[], evidence: string): PhotoPaths {
  const [a, b, c] = paths;
  if (a === undefined || paths.length > 3) {
    throw new CorruptRowError("evidence_photos", `${evidence}: 写真は1〜3枚`);
  }
  if (b === undefined) return [a];
  if (c === undefined) return [a, b];
  return [a, b, c];
}

export function toEvidence(row: Row<TaskEvidencesTable>, photos: Row<EvidencePhotosTable>[]): Evidence {
  const sorted = photos.filter((p) => p.evidence_id === row.id).sort((x, y) => x.display_order - y.display_order);
  return {
    id: evidenceId(row.id),
    taskId: taskId(row.task_id),
    submissionType: oneOf(SUBMISSION_TYPES, row.submission_type, "task_evidences", "submission_type"),
    comment: row.comment,
    submittedAt: row.submitted_at,
    photos: toPhotoPaths(
      sorted.map((p) => p.storage_path),
      row.id,
    ),
  };
}

export function rowToUploadSession(row: Row<EvidenceUploadSessionsTable>): UploadSession {
  const common = {
    id: uploadSessionId(row.id),
    taskId: taskId(row.task_id),
    userId: userId(row.user_id),
    startedAt: row.started_at,
    uploadExpiresAt: row.upload_expires_at,
  };
  const type = oneOf(SUBMISSION_TYPES, row.submission_type, "evidence_upload_sessions", "submission_type");
  switch (row.status) {
    case "uploading":
      return type === "initial"
        ? { ...common, submissionType: "initial", status: "uploading" }
        : { ...common, submissionType: "additional", status: "uploading" };
    case "completed": {
      const done: CompletedSession = {
        ...common,
        submissionType: type,
        status: "completed",
        completedAt: nonNull(row.completed_at, "evidence_upload_sessions", "completed_at"),
      };
      return done;
    }
    case "expired":
    case "cancelled":
      return { ...common, submissionType: type, status: row.status };
    default:
      throw new CorruptRowError("evidence_upload_sessions", `status が不正: ${row.status}`);
  }
}
