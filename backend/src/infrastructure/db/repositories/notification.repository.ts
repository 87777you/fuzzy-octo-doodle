import type { Notification } from "../../../domain/notification/notification.ts";
import type { NotificationId, UserId } from "../../../domain/shared/ids.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { decodeCursor, toPage } from "../cursor.ts";
import { insertUnlessDuplicate } from "../errors.ts";
import { toNumber } from "../mappers/common.ts";
import { rowToNotification } from "../mappers/misc.mapper.ts";
import { dbOf } from "../tx.ts";

export class KyselyNotificationRepository implements NotificationRepository {
  async insertIfAbsent(tx: Tx, n: Notification): Promise<void> {
    await insertUnlessDuplicate(tx, (q) =>
      q
        .insertInto("notifications")
        .values({
          id: n.id,
          user_id: n.userId,
          type: n.type,
          title: n.title,
          body: n.body,
          related_task_id: n.relatedTaskId,
          read_at: n.readAt,
          created_at: n.createdAt,
          deduplication_key: n.deduplicationKey,
        })
        .execute(),
    );
  }

  async list(
    tx: Tx,
    user: UserId,
    filter: "all" | "unread",
    cursor: string | undefined,
    limit: number,
  ): Promise<Page<Notification>> {
    let qb = dbOf(tx).selectFrom("notifications").selectAll().where("user_id", "=", user);
    if (filter === "unread") qb = qb.where("read_at", "is", null);
    if (cursor !== undefined) {
      const c = decodeCursor(cursor);
      qb = qb.where((eb) => eb.or([eb("created_at", "<", c.at), eb.and([eb("created_at", "=", c.at), eb("id", "<", c.id)])]));
    }
    const rows = await qb.orderBy("created_at", "desc").orderBy("id", "desc").limit(limit + 1).execute();
    return toPage(rows, limit, rowToNotification, (r) => ({ at: r.created_at, id: r.id }));
  }

  async countUnread(tx: Tx, user: UserId): Promise<number> {
    const row = await dbOf(tx)
      .selectFrom("notifications")
      .select((eb) => eb.fn.countAll<string | number | bigint>().as("c"))
      .where("user_id", "=", user)
      .where("read_at", "is", null)
      .executeTakeFirst();
    return row === undefined ? 0 : toNumber(row.c);
  }

  async markRead(tx: Tx, user: UserId, id: NotificationId, now: Date): Promise<void> {
    await dbOf(tx)
      .updateTable("notifications")
      .set({ read_at: now })
      .where("id", "=", id)
      .where("user_id", "=", user)
      .where("read_at", "is", null)
      .execute();
  }

  async markAllRead(tx: Tx, user: UserId, now: Date): Promise<void> {
    await dbOf(tx)
      .updateTable("notifications")
      .set({ read_at: now })
      .where("user_id", "=", user)
      .where("read_at", "is", null)
      .execute();
  }
}
