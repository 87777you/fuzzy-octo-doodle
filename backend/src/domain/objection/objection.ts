import { DomainError } from "../shared/errors.ts";
import type { ObjectionId, TaskId, UserId } from "../shared/ids.ts";

export const REASON_TYPES = ["insufficient_evidence", "conditions_not_met", "other"] as const;
export type ReasonType = (typeof REASON_TYPES)[number];

export interface ObjectionProps {
  id: ObjectionId;
  taskId: TaskId;
  objectorId: UserId;
  reviewRound: 1 | 2;
  reasonType: ReasonType;
  reasonDetail: string;
  createdAt: Date;
  withdrawnAt: Date | null;
}

export class Objection {
  private props: ObjectionProps;
  private constructor(props: ObjectionProps) {
    this.props = props;
  }

  /** 認可（フレンドか・所有者でないか）は application 層で visibility-policy を使って検証済みであること */
  static create(
    input: {
      id: ObjectionId;
      taskId: TaskId;
      objectorId: UserId;
      reviewRound: 1 | 2;
      reasonType: ReasonType;
      reasonDetail: string;
    },
    now: Date,
  ): Objection {
    if (!REASON_TYPES.includes(input.reasonType))
      throw new DomainError("VALIDATION_ERROR", "理由区分が不正です");
    const detail = input.reasonDetail.trim();
    if (!detail) throw new DomainError("VALIDATION_ERROR", "具体的な説明は必須です");
    return new Objection({ ...input, reasonDetail: detail, createdAt: now, withdrawnAt: null });
  }
  static reconstitute(props: ObjectionProps): Objection {
    return new Objection({ ...props });
  }

  /** 申立人本人・初回異議のみ。タスク側の状態/期限検証は Task.applyObjectionWithdrawal */
  withdraw(by: UserId, now: Date): void {
    if (by !== this.props.objectorId) throw new DomainError("FORBIDDEN", "申立人のみ取り下げできます");
    if (this.props.withdrawnAt) throw new DomainError("STATE_CONFLICT", "すでに取り下げ済みです");
    this.props.withdrawnAt = now;
  }

  get id(): ObjectionId {
    return this.props.id;
  }
  get taskId(): TaskId {
    return this.props.taskId;
  }
  get objectorId(): UserId {
    return this.props.objectorId;
  }
  get reviewRound(): 1 | 2 {
    return this.props.reviewRound;
  }
  snapshot(): Readonly<ObjectionProps> {
    return { ...this.props };
  }
}
