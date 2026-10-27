import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import { OBJECT_STORAGE } from "../../../application/ports/object-storage.port.ts";
import type { ObjectStorage } from "../../../application/ports/object-storage.port.ts";
import type { PhotoExtension } from "../../../domain/evidence/upload-session.ts";
import type { PhotoSlot } from "../../../domain/evidence/upload-session.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface UploadUrlsResult {
  uploads: readonly { slot: PhotoSlot; path: string; uploadUrl: string }[];
}

export interface IssueUploadUrlsInput {
  userId: UserId;
  taskId: string;
  sessionId: string;
  photos: readonly { slot: PhotoSlot; extension: PhotoExtension }[];
}

export type IssueUploadUrlsOutput = UploadUrlsResult;

/**
 * POST /api/tasks/{id}/evidence-upload-sessions/{sessionId}/upload-urls。
 * findByIdForUpdate → expectUploading → issuePhotoPath で決めたパスに ObjectStorage.createSignedUploadUrl。
 */
@Injectable()
export class IssueUploadUrlsUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly tasks: TaskRepository;
  protected readonly uploadSessions: UploadSessionRepository;
  protected readonly storage: ObjectStorage;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
    @Inject(OBJECT_STORAGE) storage: ObjectStorage,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
    this.storage = storage;
  }

  execute(_input: IssueUploadUrlsInput): Promise<IssueUploadUrlsOutput> {
    return todo("IssueUploadUrlsUseCase");
  }
}
