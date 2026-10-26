import type { Objection } from "../../../domain/objection/objection.ts";
import { REASON_TYPES } from "../../../domain/objection/objection.ts";
import type { Row, TaskObjectionsTable } from "../schema.ts";
import { CorruptRowError, oneOf } from "./common.ts";
import { objectionId, taskId, userId } from "./ids.ts";

export function rowToObjection(row: Row<TaskObjectionsTable>): Objection {
  const common = {
    id: objectionId(row.id),
    taskId: taskId(row.task_id),
    objectorId: userId(row.user_id),
    reasonType: oneOf(REASON_TYPES, row.reason_type, "task_objections", "reason_type"),
    reasonDetail: row.reason_detail,
    createdAt: row.created_at,
  };
  const w = row.withdrawn_at;
  if (row.review_round === 1) {
    return w === null
      ? { ...common, reviewRound: 1, withdrawnAt: null }
      : { ...common, reviewRound: 1, withdrawnAt: w };
  }
  if (row.review_round === 2) {
    return w === null
      ? { ...common, reviewRound: 2, withdrawnAt: null }
      : { ...common, reviewRound: 2, withdrawnAt: w };
  }
  throw new CorruptRowError("task_objections", `review_round が不正: ${String(row.review_round)}`);
}
