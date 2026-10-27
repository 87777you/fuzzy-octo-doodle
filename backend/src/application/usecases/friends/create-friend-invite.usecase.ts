import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { ID_GENERATOR } from "../../../application/ports/id-generator.port.ts";
import type { IdGenerator } from "../../../application/ports/id-generator.port.ts";
import { FRIEND_INVITE_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendInviteRepository } from "../../../application/ports/friendship.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface FriendInviteView {
  token: string;
  createdAt: Date;
}

export interface CreateFriendInviteInput {
  userId: UserId;
}

export type CreateFriendInviteOutput = FriendInviteView;

/**
 * POST /api/friend-invites。findActiveByInviter。なければ IdGenerator.inviteToken で作って insert する。
 */
@Injectable()
export class CreateFriendInviteUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly ids: IdGenerator;
  protected readonly invites: FriendInviteRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(FRIEND_INVITE_REPOSITORY) invites: FriendInviteRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.invites = invites;
  }

  execute(_input: CreateFriendInviteInput): Promise<CreateFriendInviteOutput> {
    return todo("CreateFriendInviteUseCase");
  }
}
