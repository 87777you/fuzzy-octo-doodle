import { Module } from "@nestjs/common";
import { PersistenceModule } from "./persistence.module.ts";
import { SharedApplicationModule } from "./shared-application.module.ts";
import { CreateTaskUseCase } from "../application/usecases/tasks/create-task.usecase.ts";
import { ListMyTasksUseCase } from "../application/usecases/tasks/list-my-tasks.usecase.ts";
import { GetTaskUseCase } from "../application/usecases/tasks/get-task.usecase.ts";
import { GetRetryTemplateUseCase } from "../application/usecases/tasks/get-retry-template.usecase.ts";
import { StartEvidenceUploadSessionUseCase } from "../application/usecases/evidence/start-evidence-upload-session.usecase.ts";
import { IssueUploadUrlsUseCase } from "../application/usecases/evidence/issue-upload-urls.usecase.ts";
import { CompleteEvidenceUploadUseCase } from "../application/usecases/evidence/complete-evidence-upload.usecase.ts";
import { ListEvidencesUseCase } from "../application/usecases/evidence/list-evidences.usecase.ts";
import { TasksController } from "../presentation/http/tasks/tasks.controller.ts";
import { EvidenceController } from "../presentation/http/evidence/evidence.controller.ts";

@Module({
  imports: [PersistenceModule, SharedApplicationModule],
  controllers: [TasksController, EvidenceController],
  providers: [CreateTaskUseCase, ListMyTasksUseCase, GetTaskUseCase, GetRetryTemplateUseCase, StartEvidenceUploadSessionUseCase, IssueUploadUrlsUseCase, CompleteEvidenceUploadUseCase, ListEvidencesUseCase],
})
export class TasksModule {}
