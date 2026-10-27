import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface UnreadCount {
  count: number;
}

export interface CountUnreadNotificationsInput {
  userId: UserId;
}

export type CountUnreadNotificationsOutput = UnreadCount;

/**
 * GET /api/notifications/unread-count。countUnread。
 */
@Injectable()
export class CountUnreadNotificationsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.notifications = notifications;
  }

  execute(_input: CountUnreadNotificationsInput): Promise<CountUnreadNotificationsOutput> {
    return todo("CountUnreadNotificationsUseCase");
  }
}
