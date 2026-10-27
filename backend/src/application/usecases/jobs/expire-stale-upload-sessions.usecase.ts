import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import type { JobResult } from "../views.ts";

export type ExpireStaleUploadSessionsOutput = JobResult;

/**
 * アップロードセッションの整理。UploadSessionRepository.expireStale。
 */
@Injectable()
export class ExpireStaleUploadSessionsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly uploadSessions: UploadSessionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.uploadSessions = uploadSessions;
  }

  execute(): Promise<ExpireStaleUploadSessionsOutput> {
    return todo("ExpireStaleUploadSessionsUseCase");
  }
}
