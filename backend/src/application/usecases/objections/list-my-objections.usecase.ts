import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { OBJECTION_REPOSITORY } from "../../../application/ports/objection.repository.ts";
import type { ObjectionRepository } from "../../../application/ports/objection.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { ObjectionSummary } from "../views.ts";

export interface ListMyObjectionsInput {
  userId: UserId;
  cursor?: string;
  limit: number;
}

export type ListMyObjectionsOutput = Page<ObjectionSummary>;

/**
 * GET /api/me/objections。listByObjector。判定が確定したタスクの写真は返さない。
 */
@Injectable()
export class ListMyObjectionsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly objections: ObjectionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(OBJECTION_REPOSITORY) objections: ObjectionRepository,
  ) {
    this.uow = uow;
    this.objections = objections;
  }

  execute(_input: ListMyObjectionsInput): Promise<ListMyObjectionsOutput> {
    return todo("ListMyObjectionsUseCase");
  }
}
