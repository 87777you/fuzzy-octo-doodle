import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { ID_GENERATOR } from "../../../application/ports/id-generator.port.ts";
import type { IdGenerator } from "../../../application/ports/id-generator.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import type { SubmissionType } from "../../../domain/evidence/upload-session.ts";
import type { UploadingSession } from "../../../domain/evidence/upload-session.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface StartEvidenceUploadSessionInput {
  userId: UserId;
  taskId: string;
  submissionType: SubmissionType;
}

export type StartEvidenceUploadSessionOutput = UploadingSession;

/**
 * POST /api/tasks/{id}/evidence-upload-sessions。findById → startInitialUpload または startAdditionalUpload
 * → UploadSessionRepository.insert。
 */
@Injectable()
export class StartEvidenceUploadSessionUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly ids: IdGenerator;
  protected readonly tasks: TaskRepository;
  protected readonly uploadSessions: UploadSessionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
  }

  execute(_input: StartEvidenceUploadSessionInput): Promise<StartEvidenceUploadSessionOutput> {
    return todo("StartEvidenceUploadSessionUseCase");
  }
}
