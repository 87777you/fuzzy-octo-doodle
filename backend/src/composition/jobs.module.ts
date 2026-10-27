import { Module } from "@nestjs/common";
import { PersistenceModule } from "./persistence.module.ts";
import { SharedApplicationModule } from "./shared-application.module.ts";
import { ExpireInitialTasksUseCase } from "../application/usecases/jobs/expire-initial-tasks.usecase.ts";
import { CloseReviewPeriodsUseCase } from "../application/usecases/jobs/close-review-periods.usecase.ts";
import { ExpireAdditionalEvidenceUseCase } from "../application/usecases/jobs/expire-additional-evidence.usecase.ts";
import { ExpireStaleUploadSessionsUseCase } from "../application/usecases/jobs/expire-stale-upload-sessions.usecase.ts";

@Module({
  imports: [PersistenceModule, SharedApplicationModule],
  controllers: [],
  providers: [ExpireInitialTasksUseCase, CloseReviewPeriodsUseCase, ExpireAdditionalEvidenceUseCase, ExpireStaleUploadSessionsUseCase],
})
export class JobsModule {}
