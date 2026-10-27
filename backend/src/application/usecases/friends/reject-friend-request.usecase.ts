import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FriendRequestView } from "../views.ts";

export interface RejectFriendRequestInput {
  userId: UserId;
  friendshipId: string;
}

export type RejectFriendRequestOutput = FriendRequestView;

/**
 * POST /api/friend-requests/{id}/reject。findById → rejectFriendship → save。
 */
@Injectable()
export class RejectFriendRequestUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly friendships: FriendshipRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.friendships = friendships;
  }

  execute(_input: RejectFriendRequestInput): Promise<RejectFriendRequestOutput> {
    return todo("RejectFriendRequestUseCase");
  }
}
