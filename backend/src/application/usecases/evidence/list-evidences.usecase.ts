import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { EVIDENCE_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { EvidenceRepository } from "../../../application/ports/evidence.repository.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { OBJECT_STORAGE } from "../../../application/ports/object-storage.port.ts";
import type { ObjectStorage } from "../../../application/ports/object-storage.port.ts";
import type { SubmissionType } from "../../../domain/evidence/upload-session.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface EvidenceListResult {
  evidences: readonly EvidenceListItem[];
}

export interface EvidenceListItem {
  submissionType: SubmissionType;
  submittedAt: Date;
  /** 署名付きの閲覧用 URL（短期） */
  photoUrls: readonly string[];
}

export interface ListEvidencesInput {
  viewerId: UserId;
  taskId: string;
}

export type ListEvidencesOutput = EvidenceListResult;

/**
 * GET /api/tasks/{id}/evidences。viewerRole → authorizePhotoAccess（null なら FORBIDDEN）
 * → listByTask → 写真ごとに createSignedReadUrl。
 */
@Injectable()
export class ListEvidencesUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly tasks: TaskRepository;
  protected readonly evidences: EvidenceRepository;
  protected readonly friendships: FriendshipRepository;
  protected readonly storage: ObjectStorage;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(EVIDENCE_REPOSITORY) evidences: EvidenceRepository,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(OBJECT_STORAGE) storage: ObjectStorage,
  ) {
    this.uow = uow;
    this.tasks = tasks;
    this.evidences = evidences;
    this.friendships = friendships;
    this.storage = storage;
  }

  execute(_input: ListEvidencesInput): Promise<ListEvidencesOutput> {
    return todo("ListEvidencesUseCase");
  }
}
