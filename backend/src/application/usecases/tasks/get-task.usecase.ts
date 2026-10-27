import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import type { TaskView } from "../../../domain/task/task-view.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface GetTaskInput {
  viewerId: UserId;
  taskId: string;
}

export type GetTaskOutput = TaskView;

/**
 * GET /api/tasks/{id}。findById → areFriends → viewerRole。
 * role が none のときは、存在を知らせないために NOT_FOUND にする。それ以外は toTaskView。
 */
@Injectable()
export class GetTaskUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly tasks: TaskRepository;
  protected readonly friendships: FriendshipRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
  ) {
    this.uow = uow;
    this.tasks = tasks;
    this.friendships = friendships;
  }

  execute(_input: GetTaskInput): Promise<GetTaskOutput> {
    return todo("GetTaskUseCase");
  }
}
