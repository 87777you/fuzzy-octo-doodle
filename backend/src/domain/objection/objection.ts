import { DomainError } from "../shared/errors.ts";
import type { ObjectionId, TaskId, UserId } from "../shared/ids.ts";
import type { ReviewingTask } from "../task/task.ts";
import type { ObjectionRight } from "../task/visibility-policy.ts";

export const REASON_TYPES = ["insufficient_evidence", "conditions_not_met", "other"] as const;
export type ReasonType = (typeof REASON_TYPES)[number];

type ObjectionBase<R extends 1 | 2> = Readonly<{
  id: ObjectionId;
  taskId: TaskId;
  objectorId: UserId;
  reviewRound: R;
  reasonType: ReasonType;
  reasonDetail: string;
  createdAt: Date;
}>;

/** 異議。round（1=初回 / 2=再審査）と取り下げ状態を型に持つ */
export type Objection<
  R extends 1 | 2 = 1 | 2,
  S extends "open" | "withdrawn" = "open" | "withdrawn",
> = R extends 1 | 2
  ? S extends "open"
    ? ObjectionBase<R> & Readonly<{ withdrawnAt: null }>
    : ObjectionBase<R> & Readonly<{ withdrawnAt: Date }>
  : never;

/**
 * 異議を作成する。ObjectionRight（authorizeObjection の結果）と審査中のタスクを要求するため、
 * フレンドでない人・本人・審査中でないタスクへの異議は型の上で作れない。
 */
export function createObjection<R extends 1 | 2>(
  input: {
    id: ObjectionId;
    task: ReviewingTask<R>;
    right: ObjectionRight;
    reasonType: ReasonType;
    reasonDetail: string;
  },
  now: Date,
): Objection<R, "open"> {
  const detail = input.reasonDetail.trim();
  if (!detail) throw new DomainError("VALIDATION_ERROR", "具体的な説明は必須です");
  const o: ObjectionBase<R> & Readonly<{ withdrawnAt: null }> = {
    id: input.id,
    taskId: input.task.id,
    objectorId: input.right.objectorId,
    reviewRound: input.task.reviewRound as R,
    reasonType: input.reasonType,
    reasonDetail: detail,
    createdAt: now,
    withdrawnAt: null,
  };
  return o as Objection<R, "open">;
}

/** 取り下げられるのは未取り下げの初回異議のみ（型で限定）。申立人本人かは実行時に検証する */
export function withdrawObjection(
  objection: Objection<1, "open">,
  by: UserId,
  now: Date,
): Objection<1, "withdrawn"> {
  if (by !== objection.objectorId) throw new DomainError("FORBIDDEN", "申立人のみ取り下げできます");
  return { ...objection, withdrawnAt: now };
}

/** DB から読んだ値を未取り下げ・初回に絞る */
export function expectOpenFirst(o: Objection): Objection<1, "open"> {
  if (o.reviewRound !== 1) throw new DomainError("STATE_CONFLICT", "再審査の異議は取り下げられません");
  if (o.withdrawnAt !== null) throw new DomainError("STATE_CONFLICT", "すでに取り下げ済みです");
  return o;
}
