import type { NotificationId, TaskId, UserId } from "../shared/ids.ts";

export const NOTIFICATION_TYPES = [
  "friend_request",
  "objection_received", // 所有者へ: 異議が成立し追加証拠待ち
  "objection_withdrawn", // 所有者へ: 取り下げにより達成
  "additional_evidence_submitted", // 申立人へ
  "judgement_finalized",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface Notification {
  readonly id: NotificationId;
  readonly userId: UserId;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly relatedTaskId: TaskId | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
  /** 同一イベントの二重通知防止キー（UNIQUE） */
  readonly deduplicationKey: string;
}
