import { Module } from "@nestjs/common";
import { PersistenceModule } from "./persistence.module.ts";
import { SharedApplicationModule } from "./shared-application.module.ts";
import { CreateObjectionUseCase } from "../application/usecases/objections/create-objection.usecase.ts";
import { WithdrawObjectionUseCase } from "../application/usecases/objections/withdraw-objection.usecase.ts";
import { ListMyObjectionsUseCase } from "../application/usecases/objections/list-my-objections.usecase.ts";
import { CreateFriendInviteUseCase } from "../application/usecases/friends/create-friend-invite.usecase.ts";
import { GetFriendInviteUseCase } from "../application/usecases/friends/get-friend-invite.usecase.ts";
import { CreateFriendRequestUseCase } from "../application/usecases/friends/create-friend-request.usecase.ts";
import { AcceptFriendRequestUseCase } from "../application/usecases/friends/accept-friend-request.usecase.ts";
import { RejectFriendRequestUseCase } from "../application/usecases/friends/reject-friend-request.usecase.ts";
import { CancelFriendRequestUseCase } from "../application/usecases/friends/cancel-friend-request.usecase.ts";
import { RemoveFriendUseCase } from "../application/usecases/friends/remove-friend.usecase.ts";
import { BlockUserUseCase } from "../application/usecases/friends/block-user.usecase.ts";
import { UnblockUserUseCase } from "../application/usecases/friends/unblock-user.usecase.ts";
import { ListFriendsUseCase } from "../application/usecases/friends/list-friends.usecase.ts";
import { ListFriendRequestsUseCase } from "../application/usecases/friends/list-friend-requests.usecase.ts";
import { ListBlockedUsersUseCase } from "../application/usecases/friends/list-blocked-users.usecase.ts";
import { ObjectionsController } from "../presentation/http/objections/objections.controller.ts";
import { FriendsController } from "../presentation/http/friends/friends.controller.ts";

@Module({
  imports: [PersistenceModule, SharedApplicationModule],
  controllers: [ObjectionsController, FriendsController],
  providers: [CreateObjectionUseCase, WithdrawObjectionUseCase, ListMyObjectionsUseCase, CreateFriendInviteUseCase, GetFriendInviteUseCase, CreateFriendRequestUseCase, AcceptFriendRequestUseCase, RejectFriendRequestUseCase, CancelFriendRequestUseCase, RemoveFriendUseCase, BlockUserUseCase, UnblockUserUseCase, ListFriendsUseCase, ListFriendRequestsUseCase, ListBlockedUsersUseCase],
})
export class SocialModule {}
