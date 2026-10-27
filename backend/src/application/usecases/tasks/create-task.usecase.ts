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
import { PAYMENT_GATEWAY } from "../../../application/ports/payment-gateway.port.ts";
import type { PaymentGateway } from "../../../application/ports/payment-gateway.port.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface CreateTaskInput {
  userId: UserId;
  /** Idempotency-Key ヘッダ。parseIdempotencyKey で検証する */
  idempotencyKey: string;
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  deadlineAt: Date;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
  /** 再挑戦のとき、元のタスクの ID */
  originalTaskId: string | null;
}

export type CreateTaskOutput = OwnerTaskView;

/**
 * POST /api/tasks。冪等性の確認（create_task）→ PaymentGateway.assertCanCreateTask → lockUserForCreation
 * → countActiveInitial → authorizeTaskCreation → parseTaskDeadline → createTask → TaskRepository.insert
 * → TaskEventPublisher.publish。1 つのトランザクションで行う。
 */
@Injectable()
export class CreateTaskUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly ids: IdGenerator;
  protected readonly idempotency: IdempotencyRepository;
  protected readonly tasks: TaskRepository;
  protected readonly payment: PaymentGateway;
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(IDEMPOTENCY_REPOSITORY) idempotency: IdempotencyRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(PAYMENT_GATEWAY) payment: PaymentGateway,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.idempotency = idempotency;
    this.tasks = tasks;
    this.payment = payment;
    this.events = events;
  }

  execute(_input: CreateTaskInput): Promise<CreateTaskOutput> {
    return todo("CreateTaskUseCase");
  }
}
