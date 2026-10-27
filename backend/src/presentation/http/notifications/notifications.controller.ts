import { Controller, Get, HttpCode, Inject, Param, Post, Query } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { CountUnreadNotificationsUseCase } from "../../../application/usecases/notifications/count-unread-notifications.usecase.ts";
import type { CountUnreadNotificationsOutput } from "../../../application/usecases/notifications/count-unread-notifications.usecase.ts";
import { ListNotificationsUseCase } from "../../../application/usecases/notifications/list-notifications.usecase.ts";
import type { ListNotificationsOutput } from "../../../application/usecases/notifications/list-notifications.usecase.ts";
import { MarkAllNotificationsReadUseCase } from "../../../application/usecases/notifications/mark-all-notifications-read.usecase.ts";
import type { MarkAllNotificationsReadOutput } from "../../../application/usecases/notifications/mark-all-notifications-read.usecase.ts";
import { MarkNotificationReadUseCase } from "../../../application/usecases/notifications/mark-notification-read.usecase.ts";
import type { MarkNotificationReadOutput } from "../../../application/usecases/notifications/mark-notification-read.usecase.ts";

/**
 * 通知の API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("notifications")
export class NotificationsController {
  constructor(
    @Inject(CountUnreadNotificationsUseCase) protected readonly countUnreadNotifications: CountUnreadNotificationsUseCase,
    @Inject(ListNotificationsUseCase) protected readonly listNotifications: ListNotificationsUseCase,
    @Inject(MarkAllNotificationsReadUseCase) protected readonly markAllNotificationsRead: MarkAllNotificationsReadUseCase,
    @Inject(MarkNotificationReadUseCase) protected readonly markNotificationRead: MarkNotificationReadUseCase,
  ) {}

  /** 通知の一覧 */
  @Get("")
  @HttpCode(200)
  listAll(@CurrentUser() _user: UserId, @Query() _query: Record<string, string | undefined>): Promise<ListNotificationsOutput> {
    return todo("NotificationsController.listAll");
  }

  /** 未読の件数 */
  @Get("unread-count")
  @HttpCode(200)
  unreadCount(@CurrentUser() _user: UserId): Promise<CountUnreadNotificationsOutput> {
    return todo("NotificationsController.unreadCount");
  }

  /** すべて既読にする */
  @Post("read-all")
  @HttpCode(204)
  readAll(@CurrentUser() _user: UserId): Promise<MarkAllNotificationsReadOutput> {
    return todo("NotificationsController.readAll");
  }

  /** 既読にする */
  @Post(":id/read")
  @HttpCode(204)
  read(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<MarkNotificationReadOutput> {
    return todo("NotificationsController.read");
  }
}
