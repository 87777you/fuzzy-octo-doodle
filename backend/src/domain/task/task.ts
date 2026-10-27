import { DomainError } from "../shared/errors.ts";
import type { TaskId, UserId } from "../shared/ids.ts";
import type { Transition } from "../shared/transition.ts";
import { addMs } from "../shared/time.ts";
import type { TaskEvent } from "./task-events.ts";
import {
  ADDITIONAL_EVIDENCE_PERIOD_MS,
  REVIEW_PERIOD_MS,
  UPLOAD_GRACE_MS,
} from "./task-policy.ts";
import type { TaskCreationPermit, TaskDeadline } from "./task-policy.ts";
import type { NonEmptyText, PenaltyAmount, TaskTitle } from "./task-values.ts";
import { parseNonEmptyText, parsePenaltyAmount, parseTaskTitle } from "./task-values.ts";
import type { Objection } from "../objection/objection.ts";

/**
 * タスクは状態ごとに別の型を持つ判別共用体（status で判別）。
 * 状態ごとに存在すべきフィールドだけが型に現れるため、
 * 「期限のない reviewing」や「異議の締切を持つ success」は表現できない。
 * 各遷移関数は遷移元の状態を引数の型で限定するため、不正な遷移はコンパイルできない。
 */
export type TaskBase = Readonly<{
  id: TaskId;
  ownerId: UserId;
  originalTaskId: TaskId | null;
  title: TaskTitle;
  achievementCondition: NonEmptyText;
  evidenceMethod: NonEmptyText;
  deadlineAt: Date;
  penaltyAmount: PenaltyAmount;
  isPenaltyPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

/** 初回証拠待ち */
export type ActiveTask = TaskBase & Readonly<{ status: "active"; reviewRound: 0 }>;

type ReviewingOf<R extends 1 | 2> = TaskBase &
  Readonly<{ status: "reviewing"; reviewRound: R; reviewDeadlineAt: Date }>;
/** 審査中。round 1=初回審査 / round 2=追加証拠後の再審査 */
export type ReviewingTask<R extends 1 | 2 = 1 | 2> = R extends 1 | 2 ? ReviewingOf<R> : never;

/** 初回異議が成立し、追加証拠待ち */
export type DisputedTask = TaskBase &
  Readonly<{ status: "disputed"; reviewRound: 1; additionalEvidenceDeadlineAt: Date }>;

/** 達成。completedAt を持つのはこの状態だけ */
export type SuccessTask = TaskBase &
  Readonly<{ status: "success"; reviewRound: 0 | 1 | 2; completedAt: Date; finalizedAt: Date }>;
/** 初回証拠未提出による未達成（請求対象） */
export type FailedTask = TaskBase & Readonly<{ status: "failed"; reviewRound: 0; finalizedAt: Date }>;
/** 判定不能（請求なし） */
export type IndeterminateTask = TaskBase &
  Readonly<{ status: "indeterminate"; reviewRound: 1 | 2; finalizedAt: Date }>;
/** 退会等による終了。MVP では生成しないが DB から読み出される可能性がある */
export type ClosedTask = TaskBase & Readonly<{ status: "closed"; reviewRound: 0 | 1 | 2; finalizedAt: Date }>;

export type FinalizedTask = SuccessTask | FailedTask | IndeterminateTask | ClosedTask;
export type Task = ActiveTask | ReviewingTask | DisputedTask | FinalizedTask;
export type TaskStatus = Task["status"];

/** DB から読んだ Task を特定の状態に絞る。違えば STATE_CONFLICT */
export function expectStatus<S extends TaskStatus>(
  task: Task,
  status: S,
  message = "現在の状態ではこの操作はできません",
): Extract<Task, { status: S }> {
  if (task.status !== status) throw new DomainError("STATE_CONFLICT", message);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- 直前の実行時検査で status === S を確認済み。ジェネリクスでは型が絞り込まれない
  return task as Extract<Task, { status: S }>;
}

function baseOf(t: TaskBase): TaskBase {
  return {
    id: t.id,
    ownerId: t.ownerId,
    originalTaskId: t.originalTaskId,
    title: t.title,
    achievementCondition: t.achievementCondition,
    evidenceMethod: t.evidenceMethod,
    deadlineAt: t.deadlineAt,
    penaltyAmount: t.penaltyAmount,
    isPenaltyPublic: t.isPenaltyPublic,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export interface NewTaskInput {
  id: TaskId;
  ownerId: UserId;
  originalTaskId: TaskId | null;
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  /** parseTaskDeadline で範囲を確認した期限 */
  deadlineAt: TaskDeadline;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
  /** authorizeTaskCreation の結果。同時に作成できる件数の上限を確認済みであることを示す */
  permit: TaskCreationPermit;
}

/**
 * タスクの遷移関数の戻り値。`next` が遷移後のタスク、`events` が今回の遷移で起きた出来事。
 * 遷移関数はタスクを書き換えない。呼び出し側（application のユースケース）が `next` を保存し、
 * `events` を投稿・通知・請求依頼に変換する。S には、その遷移で到達しうる状態の型を指定する。
 */
export type TaskTransition<S extends Task> = Transition<S, TaskEvent>;

export function createTask(input: NewTaskInput, now: Date): TaskTransition<ActiveTask> {
  const next: ActiveTask = {
    id: input.id,
    ownerId: input.ownerId,
    originalTaskId: input.originalTaskId,
    title: parseTaskTitle(input.title),
    achievementCondition: parseNonEmptyText(input.achievementCondition, "達成条件"),
    evidenceMethod: parseNonEmptyText(input.evidenceMethod, "証拠提出方法"),
    deadlineAt: input.deadlineAt,
    penaltyAmount: parsePenaltyAmount(input.penaltyAmount),
    isPenaltyPublic: input.isPenaltyPublic,
    status: "active",
    reviewRound: 0,
    createdAt: now,
    updatedAt: now,
  };
  return { next, events: [{ type: "TaskCreated", taskId: next.id, ownerId: next.ownerId }] };
}

// ---------------------------------------------------------------------------
// ユーザー操作による遷移
// ---------------------------------------------------------------------------

/** 初回証拠の提出確定。friendCount は現在のフレンド数 */
export function submitInitialEvidence(
  task: ActiveTask,
  friendCount: number,
  now: Date,
): TaskTransition<ReviewingTask<1> | SuccessTask> {
  // アップロード開始の期限検証は UploadSession 側。ここは最終防衛線（期限 + 猶予）
  if (now.getTime() > task.deadlineAt.getTime() + UPLOAD_GRACE_MS) {
    throw new DomainError("DEADLINE_EXPIRED", "提出期限を過ぎています");
  }
  const base = { ...baseOf(task), updatedAt: now };
  if (friendCount <= 0) {
    const next: SuccessTask = {
      ...base,
      status: "success",
      reviewRound: 0,
      completedAt: now,
      finalizedAt: now,
    };
    return {
      next,
      events: [
        { type: "InitialEvidenceSubmitted", taskId: task.id, ownerId: task.ownerId, reviewStarted: false },
        { type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "success" },
      ],
    };
  }
  const next: ReviewingTask<1> = {
    ...base,
    status: "reviewing",
    reviewRound: 1,
    reviewDeadlineAt: addMs(now, REVIEW_PERIOD_MS),
  };
  return {
    next,
    events: [
      { type: "InitialEvidenceSubmitted", taskId: task.id, ownerId: task.ownerId, reviewStarted: true },
    ],
  };
}

/** 追加証拠の提出確定 → 再審査（round 2） */
export function submitAdditionalEvidence(task: DisputedTask, now: Date): TaskTransition<ReviewingTask<2>> {
  if (now.getTime() > task.additionalEvidenceDeadlineAt.getTime() + UPLOAD_GRACE_MS) {
    throw new DomainError("DEADLINE_EXPIRED", "追加証拠の提出期限を過ぎています");
  }
  const next: ReviewingTask<2> = {
    ...baseOf(task),
    updatedAt: now,
    status: "reviewing",
    reviewRound: 2,
    reviewDeadlineAt: addMs(now, REVIEW_PERIOD_MS),
  };
  return {
    next,
    events: [{ type: "AdditionalEvidenceSubmitted", taskId: task.id, ownerId: task.ownerId }],
  };
}

function assertReviewOpen(task: ReviewingTask, now: Date): void {
  if (now.getTime() >= task.reviewDeadlineAt.getTime()) {
    throw new DomainError("DEADLINE_EXPIRED", "審査期間を過ぎています");
  }
}

/** 初回審査中の異議が受理された → 追加証拠待ち（先着1件の保証は ObjectionRepository.tryInsert が担う） */
export function acceptFirstObjection(task: ReviewingTask<1>, now: Date): TaskTransition<DisputedTask> {
  assertReviewOpen(task, now);
  const next: DisputedTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "disputed",
    reviewRound: 1,
    additionalEvidenceDeadlineAt: addMs(now, ADDITIONAL_EVIDENCE_PERIOD_MS),
  };
  return {
    next,
    events: [{ type: "ObjectionAccepted", taskId: task.id, ownerId: task.ownerId, round: 1 }],
  };
}

/** 再審査中の異議が受理された → 判定不能（請求なし） */
export function acceptSecondObjection(task: ReviewingTask<2>, now: Date): TaskTransition<IndeterminateTask> {
  assertReviewOpen(task, now);
  const next: IndeterminateTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "indeterminate",
    reviewRound: 2,
    finalizedAt: now,
  };
  return {
    next,
    events: [
      { type: "ObjectionAccepted", taskId: task.id, ownerId: task.ownerId, round: 2 },
      { type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "indeterminate" },
    ],
  };
}

/**
 * 初回異議の取り下げ → 即時達成。
 * 引数の型により、追加証拠提出後（reviewing）や再審査の異議（round 2）は渡せない。
 */
export function withdrawFirstObjection(
  task: DisputedTask,
  objection: Objection<1, "open">,
  now: Date,
): TaskTransition<SuccessTask> {
  if (objection.taskId !== task.id) throw new DomainError("STATE_CONFLICT", "対象のタスクが一致しません");
  if (now.getTime() > task.additionalEvidenceDeadlineAt.getTime()) {
    throw new DomainError("DEADLINE_EXPIRED", "追加証拠の期限を過ぎています");
  }
  const next: SuccessTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "success",
    reviewRound: 1,
    completedAt: now,
    finalizedAt: now,
  };
  return {
    next,
    events: [
      { type: "ObjectionWithdrawn", taskId: task.id, ownerId: task.ownerId },
      { type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "success" },
    ],
  };
}

// ---------------------------------------------------------------------------
// 時間経過による遷移（ジョブ用）。まだ確定しない場合は null を返し、何も変更しない（冪等）
// ---------------------------------------------------------------------------

/** 初回期限切れ。有効なアップロードセッションが残っている間は確定しない */
export function expireInitial(
  task: ActiveTask,
  now: Date,
  hasLiveUploadSession: boolean,
): TaskTransition<FailedTask> | null {
  if (now.getTime() <= task.deadlineAt.getTime() || hasLiveUploadSession) return null;
  const next: FailedTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "failed",
    reviewRound: 0,
    finalizedAt: now,
  };
  return {
    next,
    events: [{ type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "failed" }],
  };
}

/** 審査期間終了（異議なし）→ 達成 */
export function closeReviewPeriod(task: ReviewingTask, now: Date): TaskTransition<SuccessTask> | null {
  if (now.getTime() < task.reviewDeadlineAt.getTime()) return null;
  const next: SuccessTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "success",
    reviewRound: task.reviewRound,
    completedAt: now,
    finalizedAt: now,
  };
  return {
    next,
    events: [{ type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "success" }],
  };
}

/** 追加証拠の期限切れ → 判定不能（請求なし） */
export function expireAdditional(
  task: DisputedTask,
  now: Date,
  hasLiveUploadSession: boolean,
): TaskTransition<IndeterminateTask> | null {
  if (now.getTime() <= task.additionalEvidenceDeadlineAt.getTime() || hasLiveUploadSession) return null;
  const next: IndeterminateTask = {
    ...baseOf(task),
    updatedAt: now,
    status: "indeterminate",
    reviewRound: 1,
    finalizedAt: now,
  };
  return {
    next,
    events: [{ type: "TaskFinalized", taskId: task.id, ownerId: task.ownerId, result: "indeterminate" }],
  };
}
