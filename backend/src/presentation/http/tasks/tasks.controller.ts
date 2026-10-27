import { Body, Controller, Get, Headers, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { CreateTaskUseCase } from "../../../application/usecases/tasks/create-task.usecase.ts";
import type { CreateTaskOutput } from "../../../application/usecases/tasks/create-task.usecase.ts";
import { GetRetryTemplateUseCase } from "../../../application/usecases/tasks/get-retry-template.usecase.ts";
import type { GetRetryTemplateOutput } from "../../../application/usecases/tasks/get-retry-template.usecase.ts";
import { GetTaskUseCase } from "../../../application/usecases/tasks/get-task.usecase.ts";
import type { GetTaskOutput } from "../../../application/usecases/tasks/get-task.usecase.ts";
import { ListMyTasksUseCase } from "../../../application/usecases/tasks/list-my-tasks.usecase.ts";
import type { ListMyTasksOutput } from "../../../application/usecases/tasks/list-my-tasks.usecase.ts";

/**
 * タスクの API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("tasks")
export class TasksController {
  constructor(
    @Inject(CreateTaskUseCase) protected readonly createTask: CreateTaskUseCase,
    @Inject(GetRetryTemplateUseCase) protected readonly getRetryTemplate: GetRetryTemplateUseCase,
    @Inject(GetTaskUseCase) protected readonly getTask: GetTaskUseCase,
    @Inject(ListMyTasksUseCase) protected readonly listMyTasks: ListMyTasksUseCase,
  ) {}

  /** タスクを作る */
  @Post("")
  @HttpCode(201)
  create(@CurrentUser() _user: UserId, @Headers("idempotency-key") _key: string | undefined, @Body() _body: unknown): Promise<CreateTaskOutput> {
    return todo("TasksController.create");
  }

  /** 自分のタスクの一覧 */
  @Get("")
  @HttpCode(200)
  list(@CurrentUser() _user: UserId, @Query() _query: Record<string, string | undefined>): Promise<ListMyTasksOutput> {
    return todo("TasksController.list");
  }

  /** 再挑戦の初期値 */
  @Get(":id/retry-template")
  @HttpCode(200)
  retryTemplate(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<GetRetryTemplateOutput> {
    return todo("TasksController.retryTemplate");
  }

  /** タスクの詳細 */
  @Get(":id")
  @HttpCode(200)
  get(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<GetTaskOutput> {
    return todo("TasksController.get");
  }
}
