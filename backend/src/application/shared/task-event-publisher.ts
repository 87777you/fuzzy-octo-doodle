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
 * 遷移関数が返した `TaskEvent` を、投稿と通知に変換して保存する。
 * 呼び出し側のユースケースと同じトランザクション（`tx`）の中で呼ぶ。
 *
 * 実装の方針（対応表は docs/backend-architecture.md の「ユースケースと使う部品」）:
 * - TaskCreated → 投稿 `created`
 * - InitialEvidenceSubmitted → 投稿 `reported`
 * - TaskFinalized(failed) → 投稿 `failed`
 * - 異議・追加証拠・確定 → 通知。`deduplicationKey` は「イベントの種類 + タスク ID + 回数」で作り、二重通知を防ぐ。
 */
@Injectable()
export class TaskEventPublisher {
  protected readonly posts: PostRepository;
  protected readonly notifications: NotificationRepository;
  protected readonly ids: IdGenerator;
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

  publish(_tx: Tx, _events: readonly TaskEvent[]): Promise<void> {
    return todo("TaskEventPublisher.publish");
  }
}
