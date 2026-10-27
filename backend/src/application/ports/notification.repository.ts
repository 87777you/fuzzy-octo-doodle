import type { Notification } from "../../domain/notification/notification.ts";
import type { NotificationId, UserId } from "../../domain/shared/ids.ts";
import type { Page } from "./task.repository.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface NotificationRepository {
  /** deduplication_key が重複する場合は何もしない（冪等） */
  insertIfAbsent(tx: Tx, n: Notification): Promise<void>;
  list(
    tx: Tx,
    user: UserId,
    filter: "all" | "unread",
    cursor: string | undefined,
    limit: number,
  ): Promise<Page<Notification>>;
  countUnread(tx: Tx, user: UserId): Promise<number>;
  markRead(tx: Tx, user: UserId, id: NotificationId, now: Date): Promise<void>;
  markAllRead(tx: Tx, user: UserId, now: Date): Promise<void>;
}
export const NOTIFICATION_REPOSITORY = Symbol("NotificationRepository");
