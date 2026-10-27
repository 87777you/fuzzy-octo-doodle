import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FriendRequestView } from "../views.ts";

export interface ListFriendRequestsInput {
  userId: UserId;
  direction: "incoming" | "outgoing";
}

export type ListFriendRequestsOutput = readonly FriendRequestView[];

/**
 * GET /api/friend-requests。listIncomingPending または listOutgoingPending。
 */
@Injectable()
export class ListFriendRequestsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly friendships: FriendshipRepository;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.friendships = friendships;
    this.users = users;
  }

  execute(_input: ListFriendRequestsInput): Promise<ListFriendRequestsOutput> {
    return todo("ListFriendRequestsUseCase");
  }
}
