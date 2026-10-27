import type { Objection } from "../../../domain/objection/objection.ts";
import type { ObjectionId, TaskId, UserId } from "../../../domain/shared/ids.ts";
import type { ObjectionRepository } from "../../../application/ports/objection.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { decodeCursor, toPage } from "../cursor.ts";
import { insertUnlessDuplicate } from "../errors.ts";
import { rowToObjection } from "../mappers/objection.mapper.ts";
import { dbOf } from "../tx.ts";

export class KyselyObjectionRepository implements ObjectionRepository {
  /** UNIQUE(task_id, review_round) による先着1件。違反は false（savepoint で巻き戻す） */
  async tryInsert(tx: Tx, o: Objection<1 | 2, "open">): Promise<boolean> {
    return insertUnlessDuplicate(tx, (q) =>
      q
        .insertInto("task_objections")
        .values({
          id: o.id,
          task_id: o.taskId,
          user_id: o.objectorId,
          review_round: o.reviewRound,
          reason_type: o.reasonType,
          reason_detail: o.reasonDetail,
          created_at: o.createdAt,
          withdrawn_at: null,
        })
        .execute(),
    );
  }

  async findById(tx: Tx, id: ObjectionId): Promise<Objection | null> {
    const row = await dbOf(tx).selectFrom("task_objections").selectAll().where("id", "=", id).executeTakeFirst();
    return row === undefined ? null : rowToObjection(row);
  }

  async findByTaskAndRound(tx: Tx, taskId: TaskId, round: 1 | 2): Promise<Objection | null> {
    const row = await dbOf(tx)
      .selectFrom("task_objections")
      .selectAll()
      .where("task_id", "=", taskId)
      .where("review_round", "=", round)
      .executeTakeFirst();
    return row === undefined ? null : rowToObjection(row);
  }

  async save(tx: Tx, o: Objection<1, "withdrawn">): Promise<void> {
    await dbOf(tx).updateTable("task_objections").set({ withdrawn_at: o.withdrawnAt }).where("id", "=", o.id).execute();
  }

  async listByObjector(tx: Tx, objector: UserId, cursor: string | undefined, limit: number): Promise<Page<Objection>> {
    let qb = dbOf(tx).selectFrom("task_objections").selectAll().where("user_id", "=", objector);
    if (cursor !== undefined) {
      const c = decodeCursor(cursor);
      qb = qb.where((eb) => eb.or([eb("created_at", "<", c.at), eb.and([eb("created_at", "=", c.at), eb("id", "<", c.id)])]));
    }
    const rows = await qb.orderBy("created_at", "desc").orderBy("id", "desc").limit(limit + 1).execute();
    return toPage(rows, limit, rowToObjection, (r) => ({ at: r.created_at, id: r.id }));
  }
}
