import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { ID_GENERATOR } from "../../../application/ports/id-generator.port.ts";
import type { IdGenerator } from "../../../application/ports/id-generator.port.ts";
import { IDEMPOTENCY_REPOSITORY } from "../../../application/ports/idempotency.repository.ts";
import type { IdempotencyRepository } from "../../../application/ports/idempotency.repository.ts";
import { FRIEND_INVITE_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendInviteRepository } from "../../../application/ports/friendship.repository.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FriendRequestView } from "../views.ts";

export interface CreateFriendRequestInput {
  userId: UserId;
  idempotencyKey: string;
  inviteToken: string;
}

export type CreateFriendRequestOutput = FriendRequestView;

/**
 * POST /api/friend-requests。invite_token から findActiveByToken で招待者を特定（なければ NOT_FOUND）
 * → findByPair(forUpdate) → requestFriendship → save → 招待者へ通知。申請が作られるだけで、フレンドにはならない。
 */
@Injectable()
export class CreateFriendRequestUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly ids: IdGenerator;
  protected readonly idempotency: IdempotencyRepository;
  protected readonly invites: FriendInviteRepository;
  protected readonly friendships: FriendshipRepository;
  protected readonly users: UserRepository;
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(IDEMPOTENCY_REPOSITORY) idempotency: IdempotencyRepository,
    @Inject(FRIEND_INVITE_REPOSITORY) invites: FriendInviteRepository,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.idempotency = idempotency;
    this.invites = invites;
    this.friendships = friendships;
    this.users = users;
    this.notifications = notifications;
  }

  execute(_input: CreateFriendRequestInput): Promise<CreateFriendRequestOutput> {
    return todo("CreateFriendRequestUseCase");
  }
}
