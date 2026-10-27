import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { User } from "../../../domain/user/user.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface GetMeInput {
  userId: UserId;
}

export type GetMeOutput = User;

/**
 * GET /api/me。UserRepository.findById。
 */
@Injectable()
export class GetMeUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.users = users;
  }

  execute(_input: GetMeInput): Promise<GetMeOutput> {
    return todo("GetMeUseCase");
  }
}
