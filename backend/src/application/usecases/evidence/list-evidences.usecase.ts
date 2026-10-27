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

/** タスクに紐づく証拠項目の一覧。 */
export interface EvidenceListResult {
  /** 保存済み証拠を EvidenceListItem に変換した一覧。 */
  evidences: readonly EvidenceListItem[];
}

/** 1 回分の初回または追加証拠と、その写真の閲覧 URL。 */
export interface EvidenceListItem {
  /** initial は初回提出、additional は追加提出を表す。 */
  submissionType: SubmissionType;
  /** 証拠を確定した日時。 */
  submittedAt: Date;
  /** 写真ごとの短期署名付き閲覧 URL。認可後に ObjectStorage が発行する。 */
  photoUrls: readonly string[];
}

/** ListEvidencesUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListEvidencesInput {
  /** 認証済みセッションから得た閲覧者 ID。@CurrentUser() で名目型として検証済み。 */
  viewerId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: string;
}

/** 権限を確認した証拠一覧。各写真 URL は短期署名付きで、判定確定後のフレンドには発行しない。 */
export type ListEvidencesOutput = EvidenceListResult;

/**
 * 責務: 本人または許可されたフレンドに証拠一覧と写真の短期閲覧 URL を返す。権限のない利用者には URL を発行しない。
 *
 * 全体の流れ:
 *   GET /api/tasks/{id}/evidences
 *     → EvidenceController.list（認証利用者と :id を検証）
 *     → ListEvidencesUseCase.execute
 *     → TaskRepository.findById / FriendshipRepository.areFriends
 *     → domain: viewerRole / authorizePhotoAccess
 *     → EvidenceRepository.listByTask / ObjectStorage.createSignedReadUrl
 *   判定確定後はフレンド向けの写真アクセスを許可しない。
 *
 * 処理:
 *   1. parseTaskId 済みの taskId で UnitOfWork.run 内から TaskRepository.findById(tx, taskId) を呼ぶ。タスクがなければ NOT_FOUND を返す。
 *   2. FriendshipRepository.areFriends(tx, task.ownerId, viewerId) を調べ、viewerRole(task.ownerId, viewerId, isFriend) で閲覧者の役割を決める。role が none なら対象の存在を隠して NOT_FOUND を返す。
 *   3. authorizePhotoAccess(task, role) を呼ぶ。結果が null なら FORBIDDEN を返す。本人は常に許可され、フレンドは reviewing または disputed の間だけ許可される。
 *   4. EvidenceRepository.listByTask(tx, taskId) で証拠を取得し、各写真について ObjectStorage.createSignedReadUrl(grant, path, expiresInSec) を呼ぶ。
 *   5. submissionType、submittedAt、photoUrls を EvidenceListItem にまとめ、EvidenceListResult として返す。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): タスクがない、または閲覧者が本人でもフレンドでもない。
 *   - DomainError("FORBIDDEN"): 利用者は本人またはフレンドだが、現在のタスク状態では写真を閲覧できない。
 *
 * 注意:
 *   - authorizePhotoAccess が返す PhotoAccessGrant を使って署名 URL を発行する。grant を経由しない写真 URL の発行を行わない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ListEvidencesUseCase {
  /** タスク・権限・証拠を読み取る処理境界である。 */
  protected readonly uow: UnitOfWork;
  /** 対象タスクの存在と所有者を取得する。 */
  protected readonly tasks: TaskRepository;
  /** 対象タスクに保存された証拠を取得する。 */
  protected readonly evidences: EvidenceRepository;
  /** 閲覧者とタスク所有者のフレンド関係を確認する。 */
  protected readonly friendships: FriendshipRepository;
  /** 閲覧を許可した写真に短期署名付き GET URL を発行する。 */
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

  /**
   * 本人または許可されたフレンドに証拠一覧と写真の短期閲覧 URL を返す。権限のない利用者には URL を発行しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ListEvidencesInput): Promise<ListEvidencesOutput> {
    return todo("ListEvidencesUseCase");
  }
}
