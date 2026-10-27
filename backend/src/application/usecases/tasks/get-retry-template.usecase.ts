import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** 再挑戦の画面に入れる初期値。保存はしない */
export interface RetryTemplate {
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
  originalTaskId: TaskId;
}

export interface GetRetryTemplateInput {
  userId: UserId;
  taskId: string;
}

export type GetRetryTemplateOutput = RetryTemplate;

/**
 * GET /api/tasks/{id}/retry-template。本人のタスクを取得し、入力値だけを返す。他人のタスクは NOT_FOUND。
 */
@Injectable()
export class GetRetryTemplateUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly tasks: TaskRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
  ) {
    this.uow = uow;
    this.tasks = tasks;
  }

  execute(_input: GetRetryTemplateInput): Promise<GetRetryTemplateOutput> {
    return todo("GetRetryTemplateUseCase");
  }
}
