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
import { PAYMENT_GATEWAY } from "../../../application/ports/payment-gateway.port.ts";
import type { PaymentGateway } from "../../../application/ports/payment-gateway.port.ts";
import type { JobResult } from "../views.ts";

/** ExpireInitialTasksUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ExpireInitialTasksInput {
  /** ジョブ起動側が指定する1回の処理上限。単位はタスク件数であり、外部入力かどうかは起動方式の決定後に検証する。 */
  batchSize: number;
}

/** ジョブの実行結果を表す JobResult。processed は処理した対象件数であり、HTTP レスポンスではない。 */
export type ExpireInitialTasksOutput = JobResult;

/**
 * 責務: 期限を過ぎた初回証拠待ちタスクを failed に確定し、失敗イベントと請求依頼につなぐ。ジョブの起動方法や認証は担わない。
 *
 * 全体の流れ:
 *   定期ジョブの起動元（方式は未決定）
 *     → ExpireInitialTasksUseCase.execute
 *     → TaskRepository.lockExpiredInitial / UploadSessionRepository.hasLiveSession
 *     → domain の expireInitial
 *     → TaskRepository.save / TaskEventPublisher.publish
 *     → コミット後に PaymentGateway.requestCharge。
 *
 * 処理:
 *   1. Clock.now() を取得し、batchSize を上限として対象を処理する。各タスクの処理は UnitOfWork.run の別トランザクションに分ける。
 *   2. TaskRepository.lockExpiredInitial(tx, now, limit) で期限切れ候補をロックする。FOR UPDATE SKIP LOCKED により、並行ジョブが同じ行を同時に取らない。
 *   3. 各 ActiveTask について UploadSessionRepository.hasLiveSession(tx, task.id, "initial", now) を確認し、expireInitial(task, now, hasLiveSession) を呼ぶ。有効なアップロードが残る場合は null となり、確定しない。
 *   4. 遷移が null でなければ TaskRepository.save(tx, transition.next) と TaskEventPublisher.publish(tx, transition.events) を同じトランザクションで実行する。
 *   5. failed への遷移をコミットした後、PaymentGateway.requestCharge({ taskId, userId, amount }) を呼ぶ。
 *
 * 注意:
 *   - 1件の処理失敗はその1件のトランザクションだけをロールバックし、残りの対象を続ける。ジョブは HTTP クライアントへ DomainError を返さない。
 *   - PaymentGateway.requestCharge は外部 I/O であるため、UnitOfWork.run の外、DB コミット後にだけ呼ぶ。
 *   - lockExpiredInitial は FOR UPDATE SKIP LOCKED を使う。複数ワーカー間で対象行を分担する。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ExpireInitialTasksUseCase {
  /** 期限切れタスクを1件ごとのトランザクションで処理する。 */
  protected readonly uow: UnitOfWork;
  /** 期限判定とイベントに使う現在時刻を取得する。 */
  protected readonly clock: Clock;
  /** 期限切れ候補をロックし、遷移後のタスクを保存する。 */
  protected readonly tasks: TaskRepository;
  /** 期限内に開始した有効な初回アップロードが残るか確認する。 */
  protected readonly uploadSessions: UploadSessionRepository;
  /** 未達成イベントを投稿と通知に変換して同じトランザクションで保存する。 */
  protected readonly events: TaskEventPublisher;
  /** 未達成が確定したタスクの請求をトランザクションのコミット後に依頼する。 */
  protected readonly payment: PaymentGateway;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY) uploadSessions: UploadSessionRepository,
    @Inject(TaskEventPublisher) events: TaskEventPublisher,
    @Inject(PAYMENT_GATEWAY) payment: PaymentGateway,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.tasks = tasks;
    this.uploadSessions = uploadSessions;
    this.events = events;
    this.payment = payment;
  }

  /**
   * 期限を過ぎた初回証拠待ちタスクを failed に確定し、失敗イベントと請求依頼につなぐ。ジョブの起動方法や認証は担わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ExpireInitialTasksInput): Promise<ExpireInitialTasksOutput> {
    return todo("ExpireInitialTasksUseCase");
  }
}
