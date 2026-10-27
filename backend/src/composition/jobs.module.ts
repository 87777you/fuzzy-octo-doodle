import { Module } from "@nestjs/common";
import { PersistenceModule } from "./persistence.module.ts";
import { SharedApplicationModule } from "./shared-application.module.ts";
import { ExpireInitialTasksUseCase } from "../application/usecases/jobs/expire-initial-tasks.usecase.ts";
import { CloseReviewPeriodsUseCase } from "../application/usecases/jobs/close-review-periods.usecase.ts";
import { ExpireAdditionalEvidenceUseCase } from "../application/usecases/jobs/expire-additional-evidence.usecase.ts";
import { ExpireStaleUploadSessionsUseCase } from "../application/usecases/jobs/expire-stale-upload-sessions.usecase.ts";

/**
 * 責務: 定期ジョブの UseCase を Nest の DI に登録する composition 層である。ジョブの実行スケジュールや処理本体は担わない。
 *
 * composition 層。コントローラとユースケースを Nest の DI に登録し、AppModule から読み込まれる。
 * ユースケースが @Inject する port（リポジトリなど）は、PersistenceModule が束縛して公開している。
 * ユースケースを足したら、providers に追加する（追加し忘れると起動時に依存が解決できずに失敗する）。
 * Controller は置かない。ジョブを HTTP endpoint から起動するか別プロセスから起動するか、HTTP の場合の呼び出し元認証をどうするかは docs/backend-architecture.md の「未決定」に記載された未決事項である。
 */
@Module({
  imports: [PersistenceModule, SharedApplicationModule],
  controllers: [],
  providers: [ExpireInitialTasksUseCase, CloseReviewPeriodsUseCase, ExpireAdditionalEvidenceUseCase, ExpireStaleUploadSessionsUseCase],
})
export class JobsModule {}
