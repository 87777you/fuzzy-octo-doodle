import { Catch, HttpException, Logger } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/shared/errors.ts";
import type { ErrorResponseBody } from "./error-response.ts";
import { HTTP_STATUS_BY_ERROR_CODE } from "./http-status.ts";

/** Express の Response のうち、このフィルタが使う部分 */
interface JsonResponse {
  status(code: number): { json(body: ErrorResponseBody): void };
}

/**
 * すべての例外を API 設計書のエラーレスポンスに変換する。
 * - DomainError → code に対応するステータス
 * - ZodError（入力の検証）→ 400 VALIDATION_ERROR
 * - Nest 自身の HttpException（存在しない URL など）→ ステータスに対応する code
 * - それ以外 → 500。詳細はログにだけ出し、レスポンスには含めない
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<JsonResponse>();

    if (exception instanceof DomainError) {
      response.status(HTTP_STATUS_BY_ERROR_CODE[exception.code]).json({
        error: { code: exception.code, message: exception.message, details: exception.details },
      });
      return;
    }
    if (exception instanceof ZodError) {
      response.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "入力が不正です", details: exception.issues },
      });
      return;
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code =
        status === 401 ? "UNAUTHENTICATED" : status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "VALIDATION_ERROR";
      if (status >= 500) {
        this.logger.error(exception.message, exception.stack);
        response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "サーバーでエラーが発生しました" } });
        return;
      }
      response.status(status).json({ error: { code, message: exception.message } });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.message : String(exception), exception instanceof Error ? exception.stack : undefined);
    response.status(500).json({ error: { code: "INTERNAL_ERROR", message: "サーバーでエラーが発生しました" } });
  }
}
