import { Module } from "@nestjs/common";
import { TaskEventPublisher } from "../application/shared/task-event-publisher.ts";
import { PersistenceModule } from "./persistence.module.ts";

/**
 * 責務: 複数の機能モジュールが共有する application の部品（TaskEventPublisher）を、DI に登録して公開する。
 * 機能モジュール（TasksModule など）が imports に加えると、ユースケースが TaskEventPublisher を注入できる。
 */
@Module({
  imports: [PersistenceModule],
  providers: [TaskEventPublisher],
  exports: [TaskEventPublisher],
})
export class SharedApplicationModule {}
