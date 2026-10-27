import { Module } from "@nestjs/common";
import { TaskEventPublisher } from "../application/shared/task-event-publisher.ts";
import { PersistenceModule } from "./persistence.module.ts";

/** 複数の機能で共有する application の部品 */
@Module({
  imports: [PersistenceModule],
  providers: [TaskEventPublisher],
  exports: [TaskEventPublisher],
})
export class SharedApplicationModule {}
