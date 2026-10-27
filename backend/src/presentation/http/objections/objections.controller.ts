import { Body, Controller, Get, Headers, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { CreateObjectionUseCase } from "../../../application/usecases/objections/create-objection.usecase.ts";
import type { CreateObjectionOutput } from "../../../application/usecases/objections/create-objection.usecase.ts";
import { ListMyObjectionsUseCase } from "../../../application/usecases/objections/list-my-objections.usecase.ts";
import type { ListMyObjectionsOutput } from "../../../application/usecases/objections/list-my-objections.usecase.ts";
import { WithdrawObjectionUseCase } from "../../../application/usecases/objections/withdraw-objection.usecase.ts";
import type { WithdrawObjectionOutput } from "../../../application/usecases/objections/withdraw-objection.usecase.ts";

/**
 * 異議の API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("")
export class ObjectionsController {
  constructor(
    @Inject(CreateObjectionUseCase) protected readonly createObjection: CreateObjectionUseCase,
    @Inject(ListMyObjectionsUseCase) protected readonly listMyObjections: ListMyObjectionsUseCase,
    @Inject(WithdrawObjectionUseCase) protected readonly withdrawObjection: WithdrawObjectionUseCase,
  ) {}

  /** 異議を申し立てる */
  @Post("tasks/:id/objections")
  @HttpCode(201)
  create(@CurrentUser() _user: UserId, @Headers("idempotency-key") _key: string | undefined, @Param("id") _id: string, @Body() _body: unknown): Promise<CreateObjectionOutput> {
    return todo("ObjectionsController.create");
  }

  /** 異議を取り下げる */
  @Post("objections/:objectionId/withdraw")
  @HttpCode(200)
  withdraw(@CurrentUser() _user: UserId, @Headers("idempotency-key") _key: string | undefined, @Param("objectionId") _objectionId: string): Promise<WithdrawObjectionOutput> {
    return todo("ObjectionsController.withdraw");
  }

  /** 自分の異議の一覧 */
  @Get("me/objections")
  @HttpCode(200)
  listMine(@CurrentUser() _user: UserId, @Query() _query: Record<string, string | undefined>): Promise<ListMyObjectionsOutput> {
    return todo("ObjectionsController.listMine");
  }
}
