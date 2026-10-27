import type { Task, TaskBase } from "../../../domain/task/task.ts";
import { parseNonEmptyText, parsePenaltyAmount, parseTaskTitle } from "../../../domain/task/task-values.ts";
import type { NewRow, Row, TasksTable } from "../schema.ts";
import { CorruptRowError, flag, nonNull } from "./common.ts";
import { taskId, userId } from "./ids.ts";

export type TaskRow = Row<TasksTable>;

/** 行 → Task。status と必須フィールドの組み合わせが不正な行は CorruptRowError */
export function rowToTask(row: TaskRow): Task {
  const base: TaskBase = {
    id: taskId(row.id),
    ownerId: userId(row.user_id),
    originalTaskId: row.original_task_id === null ? null : taskId(row.original_task_id),
    title: parseTaskTitle(row.title),
    achievementCondition: parseNonEmptyText(row.achievement_condition, "達成条件"),
    evidenceMethod: parseNonEmptyText(row.evidence_method, "証拠提出方法"),
    deadlineAt: row.deadline_at,
    penaltyAmount: parsePenaltyAmount(row.penalty_amount),
    isPenaltyPublic: flag(row.is_penalty_public),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const round = row.review_round;
  const bad = (detail: string): never => {
    throw new CorruptRowError("tasks", `${row.id}: ${detail}`);
  };
  switch (row.status) {
    case "active":
      return round === 0 ? { ...base, status: "active", reviewRound: 0 } : bad("active は review_round=0");
    case "reviewing":
      return round === 1 || round === 2
        ? { ...base, status: "reviewing", reviewRound: round, reviewDeadlineAt: nonNull(row.review_deadline_at, "tasks", "review_deadline_at") }
        : bad("reviewing は review_round=1|2");
    case "disputed":
      return round === 1
        ? {
            ...base,
            status: "disputed",
            reviewRound: 1,
            additionalEvidenceDeadlineAt: nonNull(row.additional_evidence_deadline_at, "tasks", "additional_evidence_deadline_at"),
          }
        : bad("disputed は review_round=1");
    case "success":
      return round === 0 || round === 1 || round === 2
        ? {
            ...base,
            status: "success",
            reviewRound: round,
            completedAt: nonNull(row.completed_at, "tasks", "completed_at"),
            finalizedAt: nonNull(row.finalized_at, "tasks", "finalized_at"),
          }
        : bad("review_round が不正");
    case "failed":
      return round === 0
        ? { ...base, status: "failed", reviewRound: 0, finalizedAt: nonNull(row.finalized_at, "tasks", "finalized_at") }
        : bad("failed は review_round=0");
    case "indeterminate":
      return round === 1 || round === 2
        ? { ...base, status: "indeterminate", reviewRound: round, finalizedAt: nonNull(row.finalized_at, "tasks", "finalized_at") }
        : bad("indeterminate は review_round=1|2");
    case "closed":
      return round === 0 || round === 1 || round === 2
        ? { ...base, status: "closed", reviewRound: round, finalizedAt: nonNull(row.finalized_at, "tasks", "finalized_at") }
        : bad("review_round が不正");
    default:
      return bad(`status が不正: ${row.status}`);
  }
}

/** 状態から決まる可変列。INSERT と UPDATE で共有する */
export function taskStateColumns(task: Task): Pick<
  NewRow<TasksTable>,
  | "status"
  | "review_round"
  | "review_deadline_at"
  | "additional_evidence_deadline_at"
  | "completed_at"
  | "finalized_at"
  | "updated_at"
> {
  return {
    status: task.status,
    review_round: task.reviewRound,
    review_deadline_at: task.status === "reviewing" ? task.reviewDeadlineAt : null,
    additional_evidence_deadline_at: task.status === "disputed" ? task.additionalEvidenceDeadlineAt : null,
    completed_at: task.status === "success" ? task.completedAt : null,
    finalized_at:
      task.status === "success" || task.status === "failed" || task.status === "indeterminate" || task.status === "closed"
        ? task.finalizedAt
        : null,
    updated_at: task.updatedAt,
  };
}

export function taskToRow(task: Task): NewRow<TasksTable> {
  return {
    id: task.id,
    user_id: task.ownerId,
    original_task_id: task.originalTaskId,
    title: task.title,
    achievement_condition: task.achievementCondition,
    evidence_method: task.evidenceMethod,
    deadline_at: task.deadlineAt,
    penalty_amount: task.penaltyAmount,
    is_penalty_public: task.isPenaltyPublic,
    created_at: task.createdAt,
    ...taskStateColumns(task),
  };
}

/** lock 系のクエリが状態を絞って取得した行を、その状態の型に絞り込む */
export function onlyStatus<S extends Task["status"]>(rows: TaskRow[], status: S): Extract<Task, { status: S }>[] {
  return rows.flatMap((r) => {
    const t = rowToTask(r);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- 直前の比較で status === S を確認済み。ジェネリクスでは型が絞り込まれない
    return t.status === status ? [t as Extract<Task, { status: S }>] : [];
  });
}
