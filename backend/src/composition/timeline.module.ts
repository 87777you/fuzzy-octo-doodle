import { Module } from "@nestjs/common";
import { PersistenceModule } from "./persistence.module.ts";
import { SharedApplicationModule } from "./shared-application.module.ts";
import { GetFeedUseCase } from "../application/usecases/feed/get-feed.usecase.ts";
import { GetPostUseCase } from "../application/usecases/feed/get-post.usecase.ts";
import { SetReactionUseCase } from "../application/usecases/feed/set-reaction.usecase.ts";
import { RemoveReactionUseCase } from "../application/usecases/feed/remove-reaction.usecase.ts";
import { ListNotificationsUseCase } from "../application/usecases/notifications/list-notifications.usecase.ts";
import { CountUnreadNotificationsUseCase } from "../application/usecases/notifications/count-unread-notifications.usecase.ts";
import { MarkNotificationReadUseCase } from "../application/usecases/notifications/mark-notification-read.usecase.ts";
import { MarkAllNotificationsReadUseCase } from "../application/usecases/notifications/mark-all-notifications-read.usecase.ts";
import { GetMeUseCase } from "../application/usecases/me/get-me.usecase.ts";
import { UpdateMeUseCase } from "../application/usecases/me/update-me.usecase.ts";
import { GetMyStatsUseCase } from "../application/usecases/me/get-my-stats.usecase.ts";
import { FeedController } from "../presentation/http/feed/feed.controller.ts";
import { NotificationsController } from "../presentation/http/notifications/notifications.controller.ts";
import { MeController } from "../presentation/http/me/me.controller.ts";

@Module({
  imports: [PersistenceModule, SharedApplicationModule],
  controllers: [FeedController, NotificationsController, MeController],
  providers: [GetFeedUseCase, GetPostUseCase, SetReactionUseCase, RemoveReactionUseCase, ListNotificationsUseCase, CountUnreadNotificationsUseCase, MarkNotificationReadUseCase, MarkAllNotificationsReadUseCase, GetMeUseCase, UpdateMeUseCase, GetMyStatsUseCase],
})
export class TimelineModule {}
