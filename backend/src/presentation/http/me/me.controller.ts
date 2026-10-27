import { Body, Controller, Get, HttpCode, Inject, Patch } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { GetMeUseCase } from "../../../application/usecases/me/get-me.usecase.ts";
import type { GetMeOutput } from "../../../application/usecases/me/get-me.usecase.ts";
import { GetMyStatsUseCase } from "../../../application/usecases/me/get-my-stats.usecase.ts";
import type { GetMyStatsOutput } from "../../../application/usecases/me/get-my-stats.usecase.ts";
import { UpdateMeUseCase } from "../../../application/usecases/me/update-me.usecase.ts";
import type { UpdateMeOutput } from "../../../application/usecases/me/update-me.usecase.ts";

/**
 * 自分の情報の API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("me")
export class MeController {
  constructor(
    @Inject(GetMeUseCase) protected readonly getMe: GetMeUseCase,
    @Inject(GetMyStatsUseCase) protected readonly getMyStats: GetMyStatsUseCase,
    @Inject(UpdateMeUseCase) protected readonly updateMe: UpdateMeUseCase,
  ) {}

  /** 自分の情報 */
  @Get("")
  @HttpCode(200)
  show(@CurrentUser() _user: UserId): Promise<GetMeOutput> {
    return todo("MeController.show");
  }

  /** ニックネームを変える */
  @Patch("")
  @HttpCode(200)
  update(@CurrentUser() _user: UserId, @Body() _body: unknown): Promise<UpdateMeOutput> {
    return todo("MeController.update");
  }

  /** 自分の実績 */
  @Get("stats")
  @HttpCode(200)
  statistics(@CurrentUser() _user: UserId): Promise<GetMyStatsOutput> {
    return todo("MeController.statistics");
  }
}
