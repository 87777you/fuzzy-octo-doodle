import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "../presentation/http/errors/all-exceptions.filter.ts";
import { HealthController } from "../presentation/http/health.controller.ts";
import { AuthModule } from "./auth.module.ts";
import { SocialModule } from "./social.module.ts";
import { TimelineModule } from "./timeline.module.ts";
import { TasksModule } from "./tasks.module.ts";
import { PersistenceModule } from "./persistence.module.ts";

/**
 * 責務: アプリ全体の組み立て図。どのモジュール（機能）を読み込むかと、全体に効く仕組みを宣言する。
 *
 * 構成:
 * - PersistenceModule: DB 接続と、port の束縛（全機能の土台）。
 * - AuthModule: Origin とセッションのガードを全エンドポイントに適用する。
 * - TasksModule: タスクと証拠の提出。
 * - SocialModule: 異議とフレンド。
 * - TimelineModule: タイムライン、リアクション、通知、自分の情報。
 * - 定期ジョブは含めない。別エントリーポイント jobs-main.ts が JobsModule を使って実行する。
 * - HealthController: 死活監視。
 * - AllExceptionsFilter: すべての例外を API のエラーレスポンスにする（`APP_FILTER`）。
 *
 * 機能を足すときは、機能モジュールを作ってここの imports に足す。
 */
@Module({
  imports: [PersistenceModule, AuthModule, TasksModule, SocialModule, TimelineModule],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
