import { Body, Controller, Get, Headers, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { CurrentUser } from "../auth/current-user.decorator.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import { CompleteEvidenceUploadUseCase } from "../../../application/usecases/evidence/complete-evidence-upload.usecase.ts";
import type { CompleteEvidenceUploadOutput } from "../../../application/usecases/evidence/complete-evidence-upload.usecase.ts";
import { IssueUploadUrlsUseCase } from "../../../application/usecases/evidence/issue-upload-urls.usecase.ts";
import type { IssueUploadUrlsOutput } from "../../../application/usecases/evidence/issue-upload-urls.usecase.ts";
import { ListEvidencesUseCase } from "../../../application/usecases/evidence/list-evidences.usecase.ts";
import type { ListEvidencesOutput } from "../../../application/usecases/evidence/list-evidences.usecase.ts";
import { StartEvidenceUploadSessionUseCase } from "../../../application/usecases/evidence/start-evidence-upload-session.usecase.ts";
import type { StartEvidenceUploadSessionOutput } from "../../../application/usecases/evidence/start-evidence-upload-session.usecase.ts";

/**
 * 証拠の提出と閲覧の API。
 * 各ハンドラの実装: Zod で入力を検証 → parse* で名目型にする → ユースケースの execute を呼ぶ。
 */
@Controller("tasks/:id")
export class EvidenceController {
  constructor(
    @Inject(CompleteEvidenceUploadUseCase) protected readonly completeEvidenceUpload: CompleteEvidenceUploadUseCase,
    @Inject(IssueUploadUrlsUseCase) protected readonly issueUploadUrls: IssueUploadUrlsUseCase,
    @Inject(ListEvidencesUseCase) protected readonly listEvidences: ListEvidencesUseCase,
    @Inject(StartEvidenceUploadSessionUseCase) protected readonly startEvidenceUploadSession: StartEvidenceUploadSessionUseCase,
  ) {}

  /** アップロードのセッションを始める */
  @Post("evidence-upload-sessions")
  @HttpCode(201)
  startSession(@CurrentUser() _user: UserId, @Param("id") _id: string, @Body() _body: unknown): Promise<StartEvidenceUploadSessionOutput> {
    return todo("EvidenceController.startSession");
  }

  /** 署名付きの アップロード URL を発行する */
  @Post("evidence-upload-sessions/:sessionId/upload-urls")
  @HttpCode(200)
  issueUrls(@CurrentUser() _user: UserId, @Param("id") _id: string, @Param("sessionId") _sessionId: string, @Body() _body: unknown): Promise<IssueUploadUrlsOutput> {
    return todo("EvidenceController.issueUrls");
  }

  /** アップロードの完了を届ける */
  @Post("evidence-upload-sessions/:sessionId/complete")
  @HttpCode(200)
  complete(@CurrentUser() _user: UserId, @Headers("idempotency-key") _key: string | undefined, @Param("id") _id: string, @Param("sessionId") _sessionId: string, @Body() _body: unknown): Promise<CompleteEvidenceUploadOutput> {
    return todo("EvidenceController.complete");
  }

  /** 証拠の一覧 */
  @Get("evidences")
  @HttpCode(200)
  list(@CurrentUser() _user: UserId, @Param("id") _id: string): Promise<ListEvidencesOutput> {
    return todo("EvidenceController.list");
  }
}
