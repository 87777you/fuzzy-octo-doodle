import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { POST_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { PostRepository } from "../../../application/ports/feed.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FeedItemView } from "../views.ts";

export interface GetFeedInput {
  userId: UserId;
  filter: "all" | "objected";
  cursor?: string;
  limit: number;
}

export type GetFeedOutput = Page<FeedItemView>;

/**
 * GET /api/feed。PostRepository.listFeed。since は now - FEED_WINDOW_DAYS。
 * タスクは TaskRepository.findByIds で取得し、toTaskView(task, "friend") で金額を伏せる。
 */
@Injectable()
export class GetFeedUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly posts: PostRepository;
  protected readonly tasks: TaskRepository;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.posts = posts;
    this.tasks = tasks;
    this.users = users;
  }

  execute(_input: GetFeedInput): Promise<GetFeedOutput> {
    return todo("GetFeedUseCase");
  }
}
