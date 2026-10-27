import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { NOTIFICATION_REPOSITORY } from "../../../application/ports/notification.repository.ts";
import type { NotificationRepository } from "../../../application/ports/notification.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** 未読通知数を返す API の本文。 */
export interface UnreadCount {
  /** 認証利用者本人の未読通知数。0件の場合も0を返す。 */
  count: number;
}

/** CountUnreadNotificationsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CountUnreadNotificationsInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
}

/** 認証利用者本人に残っている未読通知の件数。 */
export type CountUnreadNotificationsOutput = UnreadCount;

/**
 * 責務: 認証利用者本人の未読通知数を返す。通知一覧や通知状態は変更しない。
 *
 * 全体の流れ:
 *   GET /api/notifications/unread-count
 *     → NotificationsController.unreadCount（セッション利用者を取得）
 *     → この execute
 *     → NotificationRepository.countUnread
 *     → 未読件数を返す。
 *
 * 処理:
 *   1. UnitOfWork.run を開始する。
 *   2. NotificationRepository.countUnread(tx, userId) を呼び、利用者本人の未読件数を得る。
 *   3. 件数を UnreadCount.count に詰めて返す。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class CountUnreadNotificationsUseCase {
  /** 未読件数の読み取りをトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 利用者本人の未読通知数を集計する。 */
  protected readonly notifications: NotificationRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(NOTIFICATION_REPOSITORY) notifications: NotificationRepository,
  ) {
    this.uow = uow;
    this.notifications = notifications;
  }

  /**
   * 認証利用者本人の未読通知数を返す。通知一覧や通知状態は変更しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: CountUnreadNotificationsInput): Promise<CountUnreadNotificationsOutput> {
    return todo("CountUnreadNotificationsUseCase");
  }
}
