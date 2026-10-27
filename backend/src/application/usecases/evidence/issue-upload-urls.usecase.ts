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
import type { UploadUrlsResult } from "../../../domain/evidence/upload-session.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** IssueUploadUrlsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface IssueUploadUrlsInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: string;
  /** URL の :sessionId パス値。コントローラが UUID 形式を検証し UploadSessionId に変換して渡す。 */
  sessionId: string;
  /** リクエスト本文の写真枠と拡張子。配列形式を検証済みで、slot は 1〜3、extension は jpg/png/webp に限る。 */
  photos: readonly {
    /** 写真の枠番号。単位は 1〜3 の番号で、コントローラが許可値を検証済み。 */
    slot: PhotoSlot;
    /** 写真ファイルの拡張子。jpg、png、webp のいずれかで、コントローラが許可値を検証済み。 */
    extension: PhotoExtension;
  }[];
}

/** 写真枠ごとのサーバー生成パスと短期署名付きアップロード URL。クライアントは URL へ写真を直接送る。 */
export type IssueUploadUrlsOutput = UploadUrlsResult;

/**
 * 責務: 有効なアップロードセッションに対して、サーバー管理の写真パスと署名付き PUT URL を発行する。クライアント指定の任意パスは受け付けない。
 *
 * 全体の流れ:
 *   POST /api/tasks/{id}/evidence-upload-sessions/{sessionId}/upload-urls
 *     → EvidenceController.issueUrls（認証利用者、タスク ID、セッション ID、写真枠を検証）
 *     → IssueUploadUrlsUseCase.execute
 *     → TaskRepository.findByIdForUpdate / UploadSessionRepository.findByIdForUpdate
 *     → domain: expectUploading / issuePhotoPath
 *     → ObjectStorage.createSignedUploadUrl
 *   クライアントは返却 URL に写真を PUT した後、complete を呼ぶ。
 *
 * 処理:
 *   1. parseTaskId 済みの taskId と parseUploadSessionId 済みの sessionId を使い、UnitOfWork.run 内で TaskRepository.findByIdForUpdate と UploadSessionRepository.findByIdForUpdate を呼ぶ。対象がなければ NOT_FOUND を返す。
 *   2. Clock.now() を使ってセッションの完了期限を確認し、task と session の所有者・関連付けを照合する。
 *   3. expectUploading(session) で状態を uploading に絞る。完了済み・期限切れなど別状態のセッションには URL を発行しない。
 *   4. photos の各 slot と extension に対して issuePhotoPath(session, slot, extension) を呼び、セッション配下の StoragePath をサーバー側で作る。
 *   5. 各パスについて ObjectStorage.createSignedUploadUrl(path, expiresInSec) を呼び、slot、path、uploadUrl を UploadUrlsResult にまとめる。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): タスクまたはアップロードセッションが存在しない。
 *   - DomainError("FORBIDDEN"): 認証利用者がタスクまたはセッションの所有者ではない。
 *   - DomainError("STATE_CONFLICT"): アップロードセッションが uploading 状態ではない。
 *   - DomainError("DEADLINE_EXPIRED"): アップロードセッションの完了期限を過ぎた。
 *
 * 注意:
 *   - TaskRepository.findByIdForUpdate と UploadSessionRepository.findByIdForUpdate は完了処理との競合を避ける排他取得である。署名 URL 発行前に所有者・関連付け・状態を確認する。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class IssueUploadUrlsUseCase {
  /** タスクとセッションのロック付き読み取りをまとめる処理境界である。 */
  protected readonly uow: UnitOfWork;
  /** セッションのアップロード期限を現在時刻と照合するために使う。 */
  protected readonly clock: Clock;
  /** 提出対象タスクを行ロック付きで取得する。 */
  protected readonly tasks: TaskRepository;
  /** 対象セッションを行ロック付きで取得し状態を確認する。 */
  protected readonly uploadSessions: UploadSessionRepository;
  /** サーバーが決めた写真パスに対する短期署名付き PUT URL を発行する。 */
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

  /**
   * 有効なアップロードセッションに対して、サーバー管理の写真パスと署名付き PUT URL を発行する。クライアント指定の任意パスは受け付けない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: IssueUploadUrlsInput): Promise<IssueUploadUrlsOutput> {
    return todo("IssueUploadUrlsUseCase");
  }
}
