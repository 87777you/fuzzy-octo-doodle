import type { Evidence } from "../../../domain/evidence/evidence.ts";
import type { SubmissionType, UploadSession, UploadingSession } from "../../../domain/evidence/upload-session.ts";
import type { TaskId, UploadSessionId } from "../../../domain/shared/ids.ts";
import type {
  EvidenceRepository,
  UploadSessionRepository,
} from "../../../application/ports/evidence.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { rethrowAsDomain } from "../errors.ts";
import { toEvidence, rowToUploadSession } from "../mappers/evidence.mapper.ts";
import { dbOf } from "../tx.ts";

export class KyselyEvidenceRepository implements EvidenceRepository {
  async insert(tx: Tx, evidence: Evidence): Promise<void> {
    const q = dbOf(tx);
    try {
      await q
        .insertInto("task_evidences")
        .values({
          id: evidence.id,
          task_id: evidence.taskId,
          submission_type: evidence.submissionType,
          comment: evidence.comment,
          submitted_at: evidence.submittedAt,
        })
        .execute();
    } catch (e) {
      rethrowAsDomain(e, "この証拠はすでに提出されています");
    }
    await q
      .insertInto("evidence_photos")
      .values(
        evidence.photos.map((path, i) => ({
          id: `${evidence.id}-${String(i + 1)}`,
          evidence_id: evidence.id,
          storage_path: path,
          display_order: i + 1,
        })),
      )
      .execute();
  }

  async listByTask(tx: Tx, taskId: TaskId): Promise<Evidence[]> {
    const q = dbOf(tx);
    const rows = await q.selectFrom("task_evidences").selectAll().where("task_id", "=", taskId).orderBy("submitted_at").execute();
    if (rows.length === 0) return [];
    const photos = await q
      .selectFrom("evidence_photos")
      .selectAll()
      .where("evidence_id", "in", rows.map((r) => r.id))
      .execute();
    return rows.map((r) => toEvidence(r, photos));
  }

  async exists(tx: Tx, taskId: TaskId, type: SubmissionType): Promise<boolean> {
    const row = await dbOf(tx)
      .selectFrom("task_evidences")
      .select("id")
      .where("task_id", "=", taskId)
      .where("submission_type", "=", type)
      .executeTakeFirst();
    return row !== undefined;
  }
}

export class KyselyUploadSessionRepository implements UploadSessionRepository {
  async insert(tx: Tx, s: UploadingSession): Promise<void> {
    await dbOf(tx)
      .insertInto("evidence_upload_sessions")
      .values({
        id: s.id,
        task_id: s.taskId,
        user_id: s.userId,
        submission_type: s.submissionType,
        started_at: s.startedAt,
        upload_expires_at: s.uploadExpiresAt,
        status: "uploading",
        completed_at: null,
      })
      .execute();
  }

  async findByIdForUpdate(tx: Tx, id: UploadSessionId): Promise<UploadSession | null> {
    const row = await dbOf(tx)
      .selectFrom("evidence_upload_sessions")
      .selectAll()
      .where("id", "=", id)
      .forUpdate()
      .executeTakeFirst();
    return row === undefined ? null : rowToUploadSession(row);
  }

  async save(tx: Tx, s: UploadSession): Promise<void> {
    await dbOf(tx)
      .updateTable("evidence_upload_sessions")
      .set({ status: s.status, completed_at: s.status === "completed" ? s.completedAt : null })
      .where("id", "=", s.id)
      .execute();
  }

  async hasLiveSession(tx: Tx, taskId: TaskId, type: SubmissionType, now: Date): Promise<boolean> {
    const row = await dbOf(tx)
      .selectFrom("evidence_upload_sessions")
      .select("id")
      .where("task_id", "=", taskId)
      .where("submission_type", "=", type)
      .where("status", "=", "uploading")
      .where("upload_expires_at", ">=", now)
      .limit(1)
      .executeTakeFirst();
    return row !== undefined;
  }

  async expireStale(tx: Tx, now: Date): Promise<number> {
    const r = await dbOf(tx)
      .updateTable("evidence_upload_sessions")
      .set({ status: "expired" })
      .where("status", "=", "uploading")
      .where("upload_expires_at", "<", now)
      .executeTakeFirst();
    return Number(r.numUpdatedRows);
  }
}
