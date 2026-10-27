import { Body, Controller, Delete, Get, Headers, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import { Public } from "../auth/public.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { AcceptFriendRequestUseCase } from "../../../application/usecases/friends/accept-friend-request.usecase.ts";
import type { AcceptFriendRequestOutput } from "../../../application/usecases/friends/accept-friend-request.usecase.ts";
import { BlockUserUseCase } from "../../../application/usecases/friends/block-user.usecase.ts";
import type { BlockUserOutput } from "../../../application/usecases/friends/block-user.usecase.ts";
import { CancelFriendRequestUseCase } from "../../../application/usecases/friends/cancel-friend-request.usecase.ts";
import type { CancelFriendRequestOutput } from "../../../application/usecases/friends/cancel-friend-request.usecase.ts";
import { CreateFriendInviteUseCase } from "../../../application/usecases/friends/create-friend-invite.usecase.ts";
import type { CreateFriendInviteOutput } from "../../../application/usecases/friends/create-friend-invite.usecase.ts";
import { CreateFriendRequestUseCase } from "../../../application/usecases/friends/create-friend-request.usecase.ts";
import type { CreateFriendRequestOutput } from "../../../application/usecases/friends/create-friend-request.usecase.ts";
import { GetFriendInviteUseCase } from "../../../application/usecases/friends/get-friend-invite.usecase.ts";
import type { GetFriendInviteOutput } from "../../../application/usecases/friends/get-friend-invite.usecase.ts";
import { ListBlockedUsersUseCase } from "../../../application/usecases/friends/list-blocked-users.usecase.ts";
import type { ListBlockedUsersOutput } from "../../../application/usecases/friends/list-blocked-users.usecase.ts";
import { ListFriendRequestsUseCase } from "../../../application/usecases/friends/list-friend-requests.usecase.ts";
import type { ListFriendRequestsOutput } from "../../../application/usecases/friends/list-friend-requests.usecase.ts";
import { ListFriendsUseCase } from "../../../application/usecases/friends/list-friends.usecase.ts";
import type { ListFriendsOutput } from "../../../application/usecases/friends/list-friends.usecase.ts";
import { RejectFriendRequestUseCase } from "../../../application/usecases/friends/reject-friend-request.usecase.ts";
import type { RejectFriendRequestOutput } from "../../../application/usecases/friends/reject-friend-request.usecase.ts";
import { RemoveFriendUseCase } from "../../../application/usecases/friends/remove-friend.usecase.ts";
import type { RemoveFriendOutput } from "../../../application/usecases/friends/remove-friend.usecase.ts";
import { UnblockUserUseCase } from "../../../application/usecases/friends/unblock-user.usecase.ts";
import type { UnblockUserOutput } from "../../../application/usecases/friends/unblock-user.usecase.ts";

/**
 * フレンドの API（招待、申請、ブロックを含む）。招待リンクの公開情報だけは認証なし（`@Public()`）。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("")
export class FriendsController {
  constructor(
    @Inject(AcceptFriendRequestUseCase) protected readonly acceptFriendRequest: AcceptFriendRequestUseCase,
    @Inject(BlockUserUseCase) protected readonly blockUser: BlockUserUseCase,
    @Inject(CancelFriendRequestUseCase) protected readonly cancelFriendRequest: CancelFriendRequestUseCase,
    @Inject(CreateFriendInviteUseCase) protected readonly createFriendInvite: CreateFriendInviteUseCase,
    @Inject(CreateFriendRequestUseCase) protected readonly createFriendRequest: CreateFriendRequestUseCase,
    @Inject(GetFriendInviteUseCase) protected readonly getFriendInvite: GetFriendInviteUseCase,
    @Inject(ListBlockedUsersUseCase) protected readonly listBlockedUsers: ListBlockedUsersUseCase,
    @Inject(ListFriendRequestsUseCase) protected readonly listFriendRequests: ListFriendRequestsUseCase,
    @Inject(ListFriendsUseCase) protected readonly listFriends: ListFriendsUseCase,
    @Inject(RejectFriendRequestUseCase) protected readonly rejectFriendRequest: RejectFriendRequestUseCase,
    @Inject(RemoveFriendUseCase) protected readonly removeFriend: RemoveFriendUseCase,
    @Inject(UnblockUserUseCase) protected readonly unblockUser: UnblockUserUseCase,
  ) {}

  /** 招待リンクを取得（なければ作成）する */
  @Post("friend-invites")
  @HttpCode(200)
  createInvite(@CurrentUser() _user: UserId): Promise<CreateFriendInviteOutput> {
    return todo("FriendsController.createInvite");
  }

  /** 招待者の公開情報 */
  @Public()
  @Get("friend-invites/:token")
  @HttpCode(200)
  getInvite(@Param("token") _token: string): Promise<GetFriendInviteOutput> {
    return todo("FriendsController.getInvite");
  }

  /** 招待リンクからフレンド申請を送る */
  @Post("friend-requests")
  @HttpCode(201)
  createRequest(@CurrentUser() _user: UserId, @Headers("idempotency-key") _key: string | undefined, @Body() _body: unknown): Promise<CreateFriendRequestOutput> {
    return todo("FriendsController.createRequest");
  }

  /** フレンド申請の一覧 */
  @Get("friend-requests")
  @HttpCode(200)
  listRequests(@CurrentUser() _user: UserId, @Query() _query: Record<string, string | undefined>): Promise<ListFriendRequestsOutput> {
    return todo("FriendsController.listRequests");
  }

  /** 申請を承認する */
  @Post("friend-requests/:id/accept")
  @HttpCode(200)
  accept(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<AcceptFriendRequestOutput> {
    return todo("FriendsController.accept");
  }

  /** 申請を拒否する */
  @Post("friend-requests/:id/reject")
  @HttpCode(200)
  reject(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<RejectFriendRequestOutput> {
    return todo("FriendsController.reject");
  }

  /** 申請を取り消す */
  @Post("friend-requests/:id/cancel")
  @HttpCode(200)
  cancel(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<CancelFriendRequestOutput> {
    return todo("FriendsController.cancel");
  }

  /** フレンドの一覧 */
  @Get("friends")
  @HttpCode(200)
  list(@CurrentUser() _user: UserId): Promise<ListFriendsOutput> {
    return todo("FriendsController.list");
  }

  /** フレンドを解除する */
  @Delete("friends/:userId")
  @HttpCode(204)
  remove(@CurrentUser() _user: UserId, @Param("userId") _userId: string): Promise<RemoveFriendOutput> {
    return todo("FriendsController.remove");
  }

  /** ブロック中のユーザー */
  @Get("blocked-users")
  @HttpCode(200)
  listBlocked(@CurrentUser() _user: UserId): Promise<ListBlockedUsersOutput> {
    return todo("FriendsController.listBlocked");
  }

  /** ユーザーをブロックする */
  @Post("users/:userId/block")
  @HttpCode(204)
  block(@CurrentUser() _user: UserId, @Param("userId") _userId: string): Promise<BlockUserOutput> {
    return todo("FriendsController.block");
  }

  /** ブロックを解除する */
  @Delete("users/:userId/block")
  @HttpCode(204)
  unblock(@CurrentUser() _user: UserId, @Param("userId") _userId: string): Promise<UnblockUserOutput> {
    return todo("FriendsController.unblock");
  }
}
