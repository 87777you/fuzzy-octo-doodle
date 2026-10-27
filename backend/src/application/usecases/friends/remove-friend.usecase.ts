import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface RemoveFriendInput {
  userId: UserId;
  friendUserId: string;
}

export type RemoveFriendOutput = null;

/**
 * DELETE /api/friends/{userId}。findByPair(forUpdate) → removeFriendship → save。204。
 */
@Injectable()
export class RemoveFriendUseCase {
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

  execute(_input: RemoveFriendInput): Promise<RemoveFriendOutput> {
    return todo("RemoveFriendUseCase");
  }
}
