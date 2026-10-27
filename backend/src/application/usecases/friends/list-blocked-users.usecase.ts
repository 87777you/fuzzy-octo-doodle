import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { UserSummary } from "../views.ts";

export interface ListBlockedUsersInput {
  userId: UserId;
}

export type ListBlockedUsersOutput = readonly UserSummary[];

/**
 * GET /api/blocked-users。listBlockedBy → UserRepository.findByIds。
 */
@Injectable()
export class ListBlockedUsersUseCase {
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

  execute(_input: ListBlockedUsersInput): Promise<ListBlockedUsersOutput> {
    return todo("ListBlockedUsersUseCase");
  }
}
