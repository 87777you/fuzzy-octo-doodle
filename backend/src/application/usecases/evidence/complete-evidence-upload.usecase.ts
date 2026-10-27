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

/** CompleteEvidenceUploadUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CompleteEvidenceUploadInput {
  /** 認証済みセッションから得た提出者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** Idempotency-Key ヘッダの値。存在はコントローラで確認し、UUID 形式は parseIdempotencyKey で検証する。 */
  idempotencyKey: string;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: string;
  /** URL の :sessionId パス値。コントローラが UUID 形式を検証し UploadSessionId に変換して渡す。 */
  sessionId: string;
  /** リクエスト本文の写真パス一覧。各パスの安全性・件数・セッション配下かは parsePhotoPaths が検証する。 */
  photoPaths: readonly string[];
}

/** 証拠提出後の本人向けタスク表示。成功レスポンスとして冪等性記録にも保存する。 */
export type CompleteEvidenceUploadOutput = OwnerTaskView;

/**
 * 責務: アップロード済み写真を検証して証拠を確定し、タスク状態・イベント・冪等レスポンスを同じトランザクションで更新する。写真のアップロード自体は担当しない。
 *
 * 全体の流れ:
 *   POST /api/tasks/{id}/evidence-upload-sessions/{sessionId}/complete
 *     → EvidenceController.complete（認証利用者、Idempotency-Key、パス、本文を検証）
 *     → CompleteEvidenceUploadUseCase.execute
 *     → UnitOfWork.run 内で IdempotencyRepository.reserve
 *     → TaskRepository.findByIdForUpdate / UploadSessionRepository.findByIdForUpdate
 *     → domain: completeUpload / parsePhotoPaths / submitInitialEvidence または submitAdditionalEvidence
 *     → EvidenceRepository.insert / TaskRepository.save / TaskEventPublisher.publish / IdempotencyRepository.complete
 *   成功後は OwnerTaskView を返し、同じキーの再送には保存済み結果を返す。
 *
 * 処理:
 *   1. Clock.now() で現在時刻を得て、parseIdempotencyKey と要求内容の requestHash を用意する。
 *   2. UnitOfWork.run の冒頭で IdempotencyRepository.reserve(tx, userId, "complete_evidence_upload", key, requestHash, now) を呼ぶ。ハッシュ不一致は IDEMPOTENCY_KEY_REUSED、完了済みなら保存レスポンスを返す。
 *   3. 新規要求では TaskRepository.findByIdForUpdate と UploadSessionRepository.findByIdForUpdate で対象行をロックする。null なら NOT_FOUND とし、タスク・セッション・利用者の対応を確認する。
 *   4. expectUploading(session) で状態を確認し、completeUpload(session, userId, now) で所有者と完了期限を検証した CompletedSession を得て、UploadSessionRepository.save(tx, completed) で保存する。
 *   5. parsePhotoPaths(session, photoPaths) で 1〜3 枚、重複なし、セッション配下の安全な StoragePath に絞る。各パスを ObjectStorage.exists で確認し、存在しないオブジェクトは証拠として確定しない。
 *   6. EvidenceRepository.insert(tx, evidence) で証拠を保存する。同じタスク・提出種別の証拠がすでにあれば ALREADY_EXISTS となる。
 *   7. 初回提出なら FriendshipRepository.countFriends(tx, task.ownerId) を取得して submitInitialEvidence(activeTask, friendCount, now) を呼ぶ。追加提出なら submitAdditionalEvidence(disputedTask, now) を呼ぶ。
 *   8. TaskRepository.save(tx, next) で遷移後のタスクを保存し、TaskEventPublisher.publish(tx, events) でイベントに対応する投稿・通知を保存する。
 *   9. toTaskView(next, "owner") の結果を IdempotencyRepository.complete に成功レスポンスとして記録し、トランザクションのコミット後に返す。
 *
 * 失敗:
 *   - DomainError("VALIDATION_ERROR"): Idempotency-Key または写真パスの形式が不正である。
 *   - DomainError("IDEMPOTENCY_KEY_REUSED"): 同じキーが異なるリクエスト内容に使われた。
 *   - DomainError("NOT_FOUND"): タスクまたはアップロードセッションが存在しない。
 *   - DomainError("FORBIDDEN"): 提出者がタスクまたはセッションの所有者ではない。
 *   - DomainError("STATE_CONFLICT"): セッションまたはタスクが提出可能な状態ではない。
 *   - DomainError("DEADLINE_EXPIRED"): アップロード完了または証拠提出の期限を過ぎた。
 *   - DomainError("INVALID_EVIDENCE_COUNT"): 写真が 1〜3 枚でない、または同じパスが重複している。
 *   - DomainError("ALREADY_EXISTS"): 同じタスク・提出種別の証拠がすでに保存されている。
 *
 * 注意:
 *   - タスクとセッションの両方を findByIdForUpdate でロックしてから検証・遷移する。
 *   - IdempotencyRepository.reserve と complete、証拠・タスク・イベントの保存を同一トランザクションに置き、途中失敗時の部分確定を防ぐ。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class CompleteEvidenceUploadUseCase {
  /** 冪等性記録、証拠、セッション、タスク状態、イベントを一括で確定する。 */
  protected readonly uow: UnitOfWork;
  /** 完了期限と提出時刻の判定に使う現在時刻を提供する。 */
  protected readonly clock: Clock;
  /** complete_evidence_upload の重複要求を検出し、成功レスポンスを保存する。 */
  protected readonly idempotency: IdempotencyRepository;
  /** 対象タスクを行ロック付きで取得し、遷移後の状態を保存する。 */
  protected readonly tasks: TaskRepository;
  /** 対象セッションを行ロック付きで取得し、完了状態を保存する。 */
  protected readonly uploadSessions: UploadSessionRepository;
  /** 検証済み写真パスを証拠として保存する。 */
  protected readonly evidences: EvidenceRepository;
  /** 初回提出後の審査開始判定に使う所有者のフレンド数を取得する。 */
  protected readonly friendships: FriendshipRepository;
  /** 提出された各写真パスのオブジェクトが存在するか確認する。 */
  protected readonly storage: ObjectStorage;
  /** タスク遷移イベントから投稿・通知を保存する。 */
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

  /**
   * アップロード済み写真を検証して証拠を確定し、タスク状態・イベント・冪等レスポンスを同じトランザクションで更新する。写真のアップロード自体は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: CompleteEvidenceUploadInput): Promise<CompleteEvidenceUploadOutput> {
    return todo("CompleteEvidenceUploadUseCase");
  }
}
