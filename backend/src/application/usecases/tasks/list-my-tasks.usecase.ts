import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { TaskStatus } from "../../../domain/task/task-status.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface ListMyTasksInput {
  userId: UserId;
  view: "active" | "history";
  status?: TaskStatus;
  search?: string;
  cursor?: string;
  limit: number;
}

export type ListMyTasksOutput = Page<OwnerTaskView>;

/**
 * GET /api/tasks。TaskRepository.listByOwner → toTaskView(task, "owner")。
 */
@Injectable()
export class ListMyTasksUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly tasks: TaskRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
  ) {
    this.uow = uow;
    this.tasks = tasks;
  }

  execute(_input: ListMyTasksInput): Promise<ListMyTasksOutput> {
    return todo("ListMyTasksUseCase");
  }
}
