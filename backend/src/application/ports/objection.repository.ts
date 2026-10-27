import type { Objection } from "../../domain/objection/objection.ts";
import type { ObjectionId, TaskId, UserId } from "../../domain/shared/ids.ts";
import type { Page } from "./task.repository.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface ObjectionRepository {
  /**
   * UNIQUE(task_id, review_round) で先着1件を保証する。
   * @returns 挿入できたら true、既に枠が使われていれば false（取り下げ済みでも false のまま）。
   * 事前 SELECT での判定は禁止（競合するため）。
   */
  tryInsert(tx: Tx, o: Objection<1 | 2, "open">): Promise<boolean>;
  findById(tx: Tx, id: ObjectionId): Promise<Objection | null>;
  findByTaskAndRound(tx: Tx, taskId: TaskId, round: 1 | 2): Promise<Objection | null>;
  save(tx: Tx, o: Objection<1, "withdrawn">): Promise<void>; // withdrawn_at の更新
  /** 自分が申し立てた異議（全期間） */
  listByObjector(
    tx: Tx,
    objector: UserId,
    cursor: string | undefined,
    limit: number,
  ): Promise<Page<Objection>>;
}
export const OBJECTION_REPOSITORY = Symbol("ObjectionRepository");
