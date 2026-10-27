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
import { TaskEventPublisher } from "../../../application/shared/task-event-publisher.ts";
import type { JobResult } from "../../ports/usecases/job-result.ts";
import type { ExpireAdditionalEvidenceInput } from "../../ports/usecases/expire-additional-evidence.port.ts";

/**
 * 責務: 期限を過ぎた追加証拠待ちタスクを indeterminate に確定し、通知につなぐ。請求は行わず、ジョブの起動方法や認証も担わない。
 *
 * 全体の流れ:
 *   jobs-main.ts（CronJob が `node dist/jobs-main.js <ジョブ名>` で起動する別エントリーポイント）
 *     → ExpireAdditionalEvidenceUseCase.execute
 *     → TaskRepository.lockExpiredAdditional / UploadSessionRepository.hasLiveSession
 *     → domain の expireAdditional
 *     → TaskRepository.save / TaskEventPublisher.publish
 *     → JobResult。
 *
 * 処理:
 *   1. Clock.now() を取得し、batchSize を上限として対象を処理する。各タスクの処理は UnitOfWork.run の別トランザクションに分ける。
 *   2. TaskRepository.lockExpiredAdditional(tx, now, limit) で追加証拠期限切れ候補をロックする。FOR UPDATE SKIP LOCKED が並行ジョブの二重取得を防ぐ。
 *   3. 各 DisputedTask について UploadSessionRepository.hasLiveSession(tx, task.id, "additional", now) を確認し、expireAdditional(task, now, hasLiveSession) を呼ぶ。有効なアップロードが残る場合は null となり、確定しない。
 *   4. 遷移が null でなければ TaskRepository.save(tx, transition.next) と TaskEventPublisher.publish(tx, transition.events) を同じトランザクションで実行する。indeterminate は請求対象ではない。
 *
 * 注意:
 *   - 1件の処理失敗はその1件のトランザクションだけをロールバックし、残りの対象を続ける。ジョブは HTTP クライアントへ DomainError を返さない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ExpireAdditionalEvidenceUseCase {
  /** 追加証拠期限切れタスクを1件ごとのトランザクションで処理する。 */
  protected readonly uow: UnitOfWork;
  /** 追加証拠期限の判定に使う現在時刻を取得する。 */
  protected readonly clock: Clock;
  /** 期限切れ候補をロックし、遷移後のタスクを保存する。 */
  protected readonly tasks: TaskRepository;
  /** 期限内に開始した有効な追加アップロードが残るか確認する。 */
  protected readonly uploadSessions: UploadSessionRepository;
  /** 判定不能イベントから通知を作り同じトランザクションで保存する。 */
  protected readonly events: TaskEventPublisher;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
    this.events = events;
  }

  /**
   * 期限を過ぎた追加証拠待ちタスクを indeterminate に確定し、通知につなぐ。請求は行わず、ジョブの起動方法や認証も担わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ExpireAdditionalEvidenceInput): Promise<JobResult> {
    return todo("ExpireAdditionalEvidenceUseCase");
  }
}
