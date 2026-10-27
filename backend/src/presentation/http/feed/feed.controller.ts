import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Put, Query } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { GetFeedUseCase } from "../../../application/usecases/feed/get-feed.usecase.ts";
import type { GetFeedOutput } from "../../../application/usecases/feed/get-feed.usecase.ts";
import { GetPostUseCase } from "../../../application/usecases/feed/get-post.usecase.ts";
import type { GetPostOutput } from "../../../application/usecases/feed/get-post.usecase.ts";
import { RemoveReactionUseCase } from "../../../application/usecases/feed/remove-reaction.usecase.ts";
import type { RemoveReactionOutput } from "../../../application/usecases/feed/remove-reaction.usecase.ts";
import { SetReactionUseCase } from "../../../application/usecases/feed/set-reaction.usecase.ts";
import type { SetReactionOutput } from "../../../application/usecases/feed/set-reaction.usecase.ts";

/**
 * タイムラインとリアクションの API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("")
export class FeedController {
  constructor(
    @Inject(GetFeedUseCase) protected readonly getFeed: GetFeedUseCase,
    @Inject(GetPostUseCase) protected readonly getPost: GetPostUseCase,
    @Inject(RemoveReactionUseCase) protected readonly removeReaction: RemoveReactionUseCase,
    @Inject(SetReactionUseCase) protected readonly setReaction: SetReactionUseCase,
  ) {}

  /** タイムライン */
  @Get("feed")
  @HttpCode(200)
  feed(@CurrentUser() _user: UserId, @Query() _query: Record<string, string | undefined>): Promise<GetFeedOutput> {
    return todo("FeedController.feed");
  }

  /** 投稿の詳細 */
  @Get("posts/:id")
  @HttpCode(200)
  post(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<GetPostOutput> {
    return todo("FeedController.post");
  }

  /** リアクションを付ける（付け替える） */
  @Put("posts/:id/reaction")
  @HttpCode(204)
  react(@CurrentUser() _user: UserId, @Param("id") _id: string, @Body() _body: unknown): Promise<SetReactionOutput> {
    return todo("FeedController.react");
  }

  /** リアクションを外す */
  @Delete("posts/:id/reaction")
  @HttpCode(204)
  unreact(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<RemoveReactionOutput> {
    return todo("FeedController.unreact");
  }
}
