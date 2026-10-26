import { DomainError } from "../shared/errors.ts";
import { required } from "../shared/invariant.ts";
import type { TaskId, UserId } from "../shared/ids.ts";
import { addMs } from "../shared/time.ts";
import type { TaskEvent } from "./task-events.ts";
import {
  ADDITIONAL_EVIDENCE_PERIOD_MS,
  REVIEW_PERIOD_MS,
  TITLE_MAX,
  UPLOAD_GRACE_MS,
  assertDeadlineInRange,
  assertPenaltyAmount,
} from "./task-policy.ts";
import type { ReviewRound, TaskStatus } from "./task-status.ts";

export interface TaskProps {
  id: TaskId;
  ownerId: UserId;
  originalTaskId: TaskId | null;
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  deadlineAt: Date;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
  status: TaskStatus;
  reviewRound: ReviewRound;
  reviewDeadlineAt: Date | null;
  additionalEvidenceDeadlineAt: Date | null;
  reviewHasEligibleFriends: boolean;
  completedAt: Date | null;
  finalizedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTaskInput {
  id: TaskId;
  ownerId: UserId;
  originalTaskId: TaskId | null;
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  deadlineAt: Date;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
}

/**
 * タスク集約。状態遷移はすべてここに集約する。
 * 呼び出し側（UseCase）は「tasks 行を FOR UPDATE で取得 → メソッド呼び出し → save」の順に使うこと。
 */
export class Task {
  private events: TaskEvent[] = [];
  private props: TaskProps;
  private constructor(props: TaskProps) {
    this.props = props;
  }

  // ---------- 生成 ----------
  static create(input: NewTaskInput, now: Date): Task {
    const title = input.title.trim();
    if (title.length < 1 || title.length > TITLE_MAX) {
      throw new DomainError("VALIDATION_ERROR", `タイトルは1〜${String(TITLE_MAX)}文字で入力してください`);
    }
    if (!input.achievementCondition.trim()) throw new DomainError("VALIDATION_ERROR", "達成条件は必須です");
    if (!input.evidenceMethod.trim()) throw new DomainError("VALIDATION_ERROR", "証拠提出方法は必須です");
    assertDeadlineInRange(input.deadlineAt, now);
    assertPenaltyAmount(input.penaltyAmount);

    const t = new Task({
      ...input,
      title,
      achievementCondition: input.achievementCondition.trim(),
      evidenceMethod: input.evidenceMethod.trim(),
      status: "active",
      reviewRound: 0,
      reviewDeadlineAt: null,
      additionalEvidenceDeadlineAt: null,
      reviewHasEligibleFriends: false,
      completedAt: null,
      finalizedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    t.events.push({ type: "TaskCreated", taskId: input.id, ownerId: input.ownerId });
    return t;
  }

  static reconstitute(props: TaskProps): Task {
    return new Task({ ...props });
  }

  // ---------- 遷移 ----------

  /** 初回証拠の提出確定。eligibleFriendCount は「現在のフレンド数」 */
  submitInitialEvidence(eligibleFriendCount: number, now: Date): void {
    this.requireStatus("active", "初回証拠を提出できる状態ではありません");
    // アップロード開始の期限検証は UploadSession 側。ここは最終防衛線（期限 + 猶予）
    if (now.getTime() > this.props.deadlineAt.getTime() + UPLOAD_GRACE_MS) {
      throw new DomainError("DEADLINE_EXPIRED", "提出期限を過ぎています");
    }
    if (eligibleFriendCount <= 0) {
      this.props.reviewHasEligibleFriends = false;
      this.finalize("success", now);
      this.events.push({
        type: "InitialEvidenceSubmitted",
        taskId: this.id,
        ownerId: this.ownerId,
        reviewStarted: false,
      });
    } else {
      this.props.status = "reviewing";
      this.props.reviewRound = 1;
      this.props.reviewHasEligibleFriends = true;
      this.props.reviewDeadlineAt = addMs(now, REVIEW_PERIOD_MS);
      this.touch(now);
      this.events.push({
        type: "InitialEvidenceSubmitted",
        taskId: this.id,
        ownerId: this.ownerId,
        reviewStarted: true,
      });
    }
  }

  /** 追加証拠の提出確定 → 再審査（round 2） */
  submitAdditionalEvidence(now: Date): void {
    this.requireStatus("disputed", "追加証拠を提出できる状態ではありません");
    const limit = required(this.props.additionalEvidenceDeadlineAt, "additionalEvidenceDeadlineAt");
    if (now.getTime() > limit.getTime() + UPLOAD_GRACE_MS) {
      throw new DomainError("DEADLINE_EXPIRED", "追加証拠の提出期限を過ぎています");
    }
    this.props.status = "reviewing";
    this.props.reviewRound = 2;
    this.props.reviewDeadlineAt = addMs(now, REVIEW_PERIOD_MS);
    this.props.additionalEvidenceDeadlineAt = null;
    this.touch(now);
    this.events.push({ type: "AdditionalEvidenceSubmitted", taskId: this.id, ownerId: this.ownerId });
  }

  /** 異議が受理された（先着1件の保証は ObjectionRepository の UNIQUE が担う） */
  acceptObjection(now: Date): void {
    if (this.props.status !== "reviewing") {
      throw new DomainError("STATE_CONFLICT", "現在は異議を申し立てられません");
    }
    const deadline = required(this.props.reviewDeadlineAt, "reviewDeadlineAt");
    if (now.getTime() >= deadline.getTime()) {
      throw new DomainError("DEADLINE_EXPIRED", "審査期間を過ぎています");
    }
    if (this.props.reviewRound === 1) {
      this.props.status = "disputed";
      this.props.reviewDeadlineAt = null;
      this.props.additionalEvidenceDeadlineAt = addMs(now, ADDITIONAL_EVIDENCE_PERIOD_MS);
      this.touch(now);
      this.events.push({ type: "ObjectionAccepted", taskId: this.id, ownerId: this.ownerId, round: 1 });
    } else {
      this.finalize("indeterminate", now);
      this.events.push({ type: "ObjectionAccepted", taskId: this.id, ownerId: this.ownerId, round: 2 });
    }
  }

  /** 初回異議の取り下げ → 即時達成。追加証拠提出後は status が reviewing になるため自動的に拒否される */
  applyObjectionWithdrawal(objectionRound: 1 | 2, now: Date): void {
    if (objectionRound !== 1) throw new DomainError("STATE_CONFLICT", "再審査の異議は取り下げられません");
    this.requireStatus("disputed", "異議を取り下げられる状態ではありません");
    if (
      now.getTime() >
      required(this.props.additionalEvidenceDeadlineAt, "additionalEvidenceDeadlineAt").getTime()
    ) {
      throw new DomainError("DEADLINE_EXPIRED", "追加証拠の期限を過ぎています");
    }
    this.finalize("success", now);
    this.events.push({ type: "ObjectionWithdrawn", taskId: this.id, ownerId: this.ownerId });
  }

  // ---------- 時間経過による遷移（ジョブ用。条件未達なら false を返し何もしない = 冪等） ----------

  /** 初回期限切れ。有効なアップロードセッションが残っている間は確定しない */
  expireInitial(now: Date, hasLiveUploadSession: boolean): boolean {
    if (this.props.status !== "active") return false;
    if (now.getTime() <= this.props.deadlineAt.getTime()) return false;
    if (hasLiveUploadSession) return false;
    this.finalize("failed", now);
    return true;
  }

  /** 審査期間終了（異議なし）→ 達成 */
  closeReviewPeriod(now: Date): boolean {
    if (this.props.status !== "reviewing") return false;
    if (now.getTime() < required(this.props.reviewDeadlineAt, "reviewDeadlineAt").getTime()) return false;
    this.finalize("success", now);
    return true;
  }

  /** 追加証拠期限切れ → 判定不能（請求なし）。提出猶予中のセッションがあれば確定しない */
  expireAdditional(now: Date, hasLiveUploadSession: boolean): boolean {
    if (this.props.status !== "disputed") return false;
    if (
      now.getTime() <=
      required(this.props.additionalEvidenceDeadlineAt, "additionalEvidenceDeadlineAt").getTime()
    )
      return false;
    if (hasLiveUploadSession) return false;
    this.finalize("indeterminate", now);
    return true;
  }

  // ---------- 参照 ----------
  get id(): TaskId {
    return this.props.id;
  }
  get ownerId(): UserId {
    return this.props.ownerId;
  }
  get status(): TaskStatus {
    return this.props.status;
  }
  get reviewRound(): ReviewRound {
    return this.props.reviewRound;
  }
  get deadlineAt(): Date {
    return this.props.deadlineAt;
  }
  get additionalEvidenceDeadlineAt(): Date | null {
    return this.props.additionalEvidenceDeadlineAt;
  }
  get reviewDeadlineAt(): Date | null {
    return this.props.reviewDeadlineAt;
  }
  get penaltyAmount(): number {
    return this.props.penaltyAmount;
  }
  get isPenaltyPublic(): boolean {
    return this.props.isPenaltyPublic;
  }

  snapshot(): Readonly<TaskProps> {
    return { ...this.props };
  }
  pullEvents(): TaskEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  // ---------- 内部 ----------
  private requireStatus(expected: TaskStatus, message: string): void {
    if (this.props.status !== expected) throw new DomainError("STATE_CONFLICT", message);
  }
  private touch(now: Date): void {
    this.props.updatedAt = now;
  }

  private finalize(result: "success" | "failed" | "indeterminate", now: Date): void {
    this.props.status = result;
    this.props.finalizedAt = now;
    this.props.completedAt = result === "success" ? now : null;
    this.props.reviewDeadlineAt = null;
    this.props.additionalEvidenceDeadlineAt = null;
    this.touch(now);
    this.events.push({ type: "TaskFinalized", taskId: this.id, ownerId: this.ownerId, result });
  }
}
