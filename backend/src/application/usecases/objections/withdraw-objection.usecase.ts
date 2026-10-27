import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { IDEMPOTENCY_REPOSITORY } from "../../../application/ports/idempotency.repository.ts";
import type { IdempotencyRepository } from "../../../application/ports/idempotency.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { OBJECTION_REPOSITORY } from "../../../application/ports/objection.repository.ts";
import type { ObjectionRepository } from "../../../application/ports/objection.repository.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { ObjectionSummary } from "../views.ts";

export interface WithdrawObjectionInput {
  userId: UserId;
  idempotencyKey: string;
  objectionId: string;
}

export type WithdrawObjectionOutput = ObjectionSummary;

/**
 * POST /api/objections/{id}/withdraw。ObjectionRepository.findById → TaskRepository.findByIdForUpdate
 * → expectOpenFirst → withdrawObjection → withdrawFirstObjection → 保存 → 通知。
 */
@Injectable()
export class WithdrawObjectionUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly idempotency: IdempotencyRepository;
  protected readonly tasks: TaskRepository;
  protected readonly objections: ObjectionRepository;
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(IDEMPOTENCY_REPOSITORY) idempotency: IdempotencyRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(OBJECTION_REPOSITORY) objections: ObjectionRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.idempotency = idempotency;
    this.tasks = tasks;
    this.objections = objections;
    this.events = events;
  }

  execute(_input: WithdrawObjectionInput): Promise<WithdrawObjectionOutput> {
    return todo("WithdrawObjectionUseCase");
  }
}
