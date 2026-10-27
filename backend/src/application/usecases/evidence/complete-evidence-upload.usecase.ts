import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { IDEMPOTENCY_REPOSITORY } from "../../../application/ports/idempotency.repository.ts";
import type { IdempotencyRepository } from "../../../application/ports/idempotency.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import { EVIDENCE_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { EvidenceRepository } from "../../../application/ports/evidence.repository.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { OBJECT_STORAGE } from "../../../application/ports/object-storage.port.ts";
import type { ObjectStorage } from "../../../application/ports/object-storage.port.ts";
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface CompleteEvidenceUploadInput {
  userId: UserId;
  idempotencyKey: string;
  taskId: string;
  sessionId: string;
  photoPaths: readonly string[];
}

export type CompleteEvidenceUploadOutput = OwnerTaskView;

/**
 * POST /api/tasks/{id}/evidence-upload-sessions/{sessionId}/complete。
 * 手順は docs/backend-architecture.md の「証拠の提出」の complete の手順に従う。
 */
@Injectable()
export class CompleteEvidenceUploadUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly idempotency: IdempotencyRepository;
  protected readonly tasks: TaskRepository;
  protected readonly uploadSessions: UploadSessionRepository;
  protected readonly evidences: EvidenceRepository;
  protected readonly friendships: FriendshipRepository;
  protected readonly storage: ObjectStorage;
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(IDEMPOTENCY_REPOSITORY) idempotency: IdempotencyRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
    @Inject(EVIDENCE_REPOSITORY) evidences: EvidenceRepository,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(OBJECT_STORAGE) storage: ObjectStorage,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.idempotency = idempotency;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
    this.evidences = evidences;
    this.friendships = friendships;
    this.storage = storage;
    this.events = events;
  }

  execute(_input: CompleteEvidenceUploadInput): Promise<CompleteEvidenceUploadOutput> {
    return todo("CompleteEvidenceUploadUseCase");
  }
}
