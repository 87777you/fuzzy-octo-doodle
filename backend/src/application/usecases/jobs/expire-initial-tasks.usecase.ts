import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import { PAYMENT_GATEWAY } from "../../../application/ports/payment-gateway.port.ts";
import type { PaymentGateway } from "../../../application/ports/payment-gateway.port.ts";
import type { JobResult } from "../views.ts";

export interface ExpireInitialTasksInput {
  batchSize: number;
}

export type ExpireInitialTasksOutput = JobResult;

/**
 * 定期ジョブ。1 回に処理する件数を batchSize で制限し、1 件ごとに別のトランザクションで処理する。
 * lockExpiredInitial → hasLiveSession → expireInitial → 保存 → 「失敗」の投稿、通知
 * → コミット後に PaymentGateway.requestCharge（外部への依頼はトランザクションの外）。
 */
@Injectable()
export class ExpireInitialTasksUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly tasks: TaskRepository;
  protected readonly uploadSessions: UploadSessionRepository;
  protected readonly events: TaskEventPublisher;
  protected readonly payment: PaymentGateway;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
    @Inject(PAYMENT_GATEWAY) payment: PaymentGateway,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
    this.events = events;
    this.payment = payment;
  }

  execute(_input: ExpireInitialTasksInput): Promise<ExpireInitialTasksOutput> {
    return todo("ExpireInitialTasksUseCase");
  }
}
