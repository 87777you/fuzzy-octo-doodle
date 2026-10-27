import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { POST_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { PostRepository } from "../../../application/ports/feed.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FeedItemView } from "../views.ts";

export interface GetPostInput {
  userId: UserId;
  postId: string;
}

export type GetPostOutput = FeedItemView;

/**
 * GET /api/posts/{id}。findFeedItem（本人とフレンドの投稿だけ返る）。なければ NOT_FOUND。
 */
@Injectable()
export class GetPostUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly posts: PostRepository;
  protected readonly tasks: TaskRepository;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.posts = posts;
    this.tasks = tasks;
    this.users = users;
  }

  execute(_input: GetPostInput): Promise<GetPostOutput> {
    return todo("GetPostUseCase");
  }
}
