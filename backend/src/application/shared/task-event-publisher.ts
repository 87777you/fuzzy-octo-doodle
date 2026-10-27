import { Inject, Injectable } from "@nestjs/common";
import { CLOCK } from "../ports/clock.port.ts";
import type { Clock } from "../ports/clock.port.ts";
import { ID_GENERATOR } from "../ports/id-generator.port.ts";
import type { IdGenerator } from "../ports/id-generator.port.ts";
import { NOTIFICATION_REPOSITORY } from "../ports/notification.repository.ts";
import type { NotificationRepository } from "../ports/notification.repository.ts";
import { POST_REPOSITORY } from "../ports/feed.repository.ts";
import type { PostRepository } from "../ports/feed.repository.ts";
import type { Tx } from "../ports/unit-of-work.port.ts";
import type { TaskEvent } from "../../domain/task/task-events.ts";
import { todo } from "./todo.ts";

/**
 * 責務: 遷移関数が返した `TaskEvent` を、投稿と通知に変換して保存する。複数のユースケースが共有する。
 * 変換の規則を 1 か所に置くことで、「どの出来事が、誰に、どの通知になるか」をユースケースごとにずらさない。
 *
 * 全体の流れ: ユースケースが domain の遷移関数を呼ぶ（`{ next, events }` が返る）
 * → `TaskRepository.save` で next を保存する → この `publish(tx, events)` を同じトランザクションで呼ぶ。
 * 呼び出し元: CreateTask、CompleteEvidenceUpload、CreateObjection、WithdrawObjection、定期ジョブ。
 *
 * 実装の方針（対応表は docs/backend-architecture.md の「ユースケースと使う部品」）:
 * - TaskCreated → 投稿 `created`
 * - InitialEvidenceSubmitted → 投稿 `reported`
 * - TaskFinalized(failed) → 投稿 `failed`
 * - 異議・追加証拠・確定 → 通知。`deduplicationKey` は「イベントの種類 + タスク ID + 回数」で作り、二重通知を防ぐ。
 *
 * 保存には `insertIfAbsent` を使う。同じイベントを再度処理しても重複しない（ジョブの再実行に耐える）。
 * 外部への依頼（請求）はここでは行わない。コミット後にユースケースが行う。
 */
@Injectable()
export class TaskEventPublisher {
  /** 投稿の保存先。`(task_id, post_type)` が一意なので、同じ投稿は 2 件にならない */
  protected readonly posts: PostRepository;
  /** 通知の保存先。`deduplicationKey` が一意 */
  protected readonly notifications: NotificationRepository;
  /** 投稿・通知の ID の採番 */
  protected readonly ids: IdGenerator;
  /** 投稿・通知の作成日時 */
  protected readonly clock: Clock;

  constructor(
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(CLOCK) clock: Clock,
  ) {
    this.posts = posts;
    this.notifications = notifications;
    this.ids = ids;
    this.clock = clock;
  }

  /**
   * イベントを投稿と通知にして保存する。
   * @param _tx 呼び出し元のトランザクション。ユースケースの保存と同時に確定させるため、必ずこれを使う
   * @param _events 遷移関数が返したイベント。空でもよい
   */
  publish(_tx: Tx, _events: readonly TaskEvent[]): Promise<void> {
    return todo("TaskEventPublisher.publish");
  }
}
