import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { ID_GENERATOR } from "../../../application/ports/id-generator.port.ts";
import type { IdGenerator } from "../../../application/ports/id-generator.port.ts";
import { IDEMPOTENCY_REPOSITORY } from "../../../application/ports/idempotency.repository.ts";
import type { IdempotencyRepository } from "../../../application/ports/idempotency.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { OBJECTION_REPOSITORY } from "../../../application/ports/objection.repository.ts";
import type { ObjectionRepository } from "../../../application/ports/objection.repository.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { ReasonType } from "../../../domain/objection/objection.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { ObjectionSummary } from "../views.ts";

export interface CreateObjectionInput {
  userId: UserId;
  idempotencyKey: string;
  taskId: string;
  reasonType: ReasonType;
  reasonDetail: string;
}

export type CreateObjectionOutput = ObjectionSummary;

/**
 * POST /api/tasks/{id}/objections。findByIdForUpdate → areFriends → authorizeObjection → createObjection
 * → ObjectionRepository.tryInsert（false なら STATE_CONFLICT）→ acceptFirstObjection または acceptSecondObjection
 * → save → TaskEventPublisher.publish。
 */
@Injectable()
export class CreateObjectionUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly ids: IdGenerator;
  protected readonly idempotency: IdempotencyRepository;
  protected readonly tasks: TaskRepository;
  protected readonly objections: ObjectionRepository;
  protected readonly friendships: FriendshipRepository;
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(IDEMPOTENCY_REPOSITORY) idempotency: IdempotencyRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(OBJECTION_REPOSITORY) objections: ObjectionRepository,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.idempotency = idempotency;
    this.tasks = tasks;
    this.objections = objections;
    this.friendships = friendships;
    this.events = events;
  }

  execute(_input: CreateObjectionInput): Promise<CreateObjectionOutput> {
    return todo("CreateObjectionUseCase");
  }
}
