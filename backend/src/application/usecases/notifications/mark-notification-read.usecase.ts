import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface MarkNotificationReadInput {
  userId: UserId;
  notificationId: string;
}

export type MarkNotificationReadOutput = null;

/**
 * POST /api/notifications/{id}/read。markRead。204。
 */
@Injectable()
export class MarkNotificationReadUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.notifications = notifications;
  }

  execute(_input: MarkNotificationReadInput): Promise<MarkNotificationReadOutput> {
    return todo("MarkNotificationReadUseCase");
  }
}
