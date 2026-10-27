import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { UPLOAD_SESSION_REPOSITORY } from "../../../application/ports/evidence.repository.ts";
import type { UploadSessionRepository } from "../../../application/ports/evidence.repository.ts";
import type { JobResult } from "../views.ts";

/** 更新したセッション件数を含む JobResult。HTTP レスポンスではない。 */
export type ExpireStaleUploadSessionsOutput = JobResult;

/**
 * 責務: 完了期限を過ぎたアップロードセッションを整理する。タスク状態や証拠データは変更しない。
 *
 * 全体の流れ:
 *   定期ジョブの起動元（方式は未決定）
 *     → ExpireStaleUploadSessionsUseCase.execute
 *     → UploadSessionRepository.expireStale
 *     → 更新件数を JobResult として返す。
 *
 * 処理:
 *   1. UnitOfWork.run の中で Clock.now() を取得する。
 *   2. UploadSessionRepository.expireStale(tx, now) を呼び、uploading かつ完了期限を過ぎたセッションを expired に更新する。
 *   3. Repository が返した更新件数を JobResult.processed として返す。
 *
 * 注意:
 *   - ジョブの呼び出し元は HTTP Controller ではない。起動方式と認証の決定前に HTTP エンドポイントを追加しない。
 *   - この port は期限切れセッションを一括更新して件数を返し、batchSize や1件ごとの結果を受け取らない。個別失敗を分離する設計は現行の契約からは確認できない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ExpireStaleUploadSessionsUseCase {
  /** アップロードセッションの整理をトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 完了期限を過ぎたセッションを特定する現在時刻を取得する。 */
  protected readonly clock: Clock;
  /** 期限切れの uploading セッションを expired に更新し、件数を返す。 */
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

  /**
   * 完了期限を過ぎたアップロードセッションを整理する。タスク状態や証拠データは変更しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(): Promise<ExpireStaleUploadSessionsOutput> {
    return todo("ExpireStaleUploadSessionsUseCase");
  }
}
