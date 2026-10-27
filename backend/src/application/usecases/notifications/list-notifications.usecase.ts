import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { Notification } from "../../../domain/notification/notification.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** ListNotificationsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListNotificationsInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** クエリ filter。Zod で all または unread に検証済みの一覧条件である。 */
  filter: "all" | "unread";
  /** クエリ cursor。未指定なら先頭ページ、指定時は Zod の形式検証後に Repository が位置を復元する。 */
  cursor?: string;
  /** クエリ limit。1ページに含める通知件数であり、Controller が Zod で数値として検証する。 */
  limit: number;
}

/** 利用者本人の通知ページ。nextCursor は次ページがなければ null である。 */
export type ListNotificationsOutput = Page<Notification>;

/**
 * 責務: 認証利用者自身の通知を条件付きでページ取得する。通知の作成や既読更新は担わない。
 *
 * 全体の流れ:
 *   GET /api/notifications
 *     → NotificationsController.listAll（セッション利用者とクエリを検証）
 *     → この execute
 *     → NotificationRepository.list
 *     → 通知ページを返す。
 *
 * 処理:
 *   1. UnitOfWork.run を開始する。
 *   2. NotificationRepository.list(tx, userId, filter, cursor, limit) を呼ぶ。Repository は userId で所有者を絞り、unread の場合は未読だけを返す。
 *   3. 返された Page<Notification> を Output として返す。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ListNotificationsUseCase {
  /** 通知一覧の読み取りをトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 利用者・既読条件・カーソルに応じた通知ページを取得する。 */
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.notifications = notifications;
  }

  /**
   * 認証利用者自身の通知を条件付きでページ取得する。通知の作成や既読更新は担わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ListNotificationsInput): Promise<ListNotificationsOutput> {
    return todo("ListNotificationsUseCase");
  }
}
