import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { JobResult } from "../views.ts";

export interface CloseReviewPeriodsInput {
  batchSize: number;
}

export type CloseReviewPeriodsOutput = JobResult;

/**
 * 定期ジョブ。1 回に処理する件数を batchSize で制限し、1 件ごとに別のトランザクションで処理する。
 * lockReviewEnded → closeReviewPeriod → 保存 → 通知。
 */
@Injectable()
export class CloseReviewPeriodsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly tasks: TaskRepository;
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.tasks = tasks;
    this.events = events;
  }

  execute(_input: CloseReviewPeriodsInput): Promise<CloseReviewPeriodsOutput> {
    return todo("CloseReviewPeriodsUseCase");
  }
}
