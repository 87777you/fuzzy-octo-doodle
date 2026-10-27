import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "../presentation/http/errors/all-exceptions.filter.ts";
import { HealthController } from "../presentation/http/health.controller.ts";
import { AuthModule } from "./auth.module.ts";
import { SocialModule } from "./social.module.ts";
import { TasksModule } from "./tasks.module.ts";
import { PersistenceModule } from "./persistence.module.ts";

/**
 * ルートのモジュール。機能ごとのモジュール（tasks、friends など）は、ここに imports を足して登録する。
 */
@Module({
  imports: [PersistenceModule, AuthModule, TasksModule, SocialModule],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
