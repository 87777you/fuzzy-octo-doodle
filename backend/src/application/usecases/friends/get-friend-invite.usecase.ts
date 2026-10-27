import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { FRIEND_INVITE_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendInviteRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserSummary } from "../views.ts";

export interface GetFriendInviteInput {
  token: string;
}

export type GetFriendInviteOutput = UserSummary;

/**
 * GET /api/friend-invites/{token}。認証なし。findActiveByToken → 招待者のニックネームを返す。なければ NOT_FOUND。
 */
@Injectable()
export class GetFriendInviteUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly invites: FriendInviteRepository;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(FRIEND_INVITE_REPOSITORY) invites: FriendInviteRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.invites = invites;
    this.users = users;
  }

  execute(_input: GetFriendInviteInput): Promise<GetFriendInviteOutput> {
    return todo("GetFriendInviteUseCase");
  }
}
