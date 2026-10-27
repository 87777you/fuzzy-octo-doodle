import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { Notification } from "../../../domain/notification/notification.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface ListNotificationsInput {
  userId: UserId;
  filter: "all" | "unread";
  cursor?: string;
  limit: number;
}

export type ListNotificationsOutput = Page<Notification>;

/**
 * GET /api/notifications。NotificationRepository.list。
 */
@Injectable()
export class ListNotificationsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.notifications = notifications;
  }

  execute(_input: ListNotificationsInput): Promise<ListNotificationsOutput> {
    return todo("ListNotificationsUseCase");
  }
}
