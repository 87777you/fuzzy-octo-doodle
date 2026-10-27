import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { User } from "../../../domain/user/user.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface UpdateMeInput {
  userId: UserId;
  nickname: string;
}

export type UpdateMeOutput = User;

/**
 * PATCH /api/me。findById → changeNickname → save。
 */
@Injectable()
export class UpdateMeUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.users = users;
  }

  execute(_input: UpdateMeInput): Promise<UpdateMeOutput> {
    return todo("UpdateMeUseCase");
  }
}
