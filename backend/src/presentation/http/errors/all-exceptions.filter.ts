import { Catch, HttpException, Logger } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { ZodError } from "zod";
import { DomainError } from "../../../domain/shared/errors.ts";
import type { ErrorResponseBody } from "./error-response.ts";
import { HTTP_STATUS_BY_ERROR_CODE } from "./http-status.ts";

/** Express の Response のうち、このフィルタが使う部分だけを型にしたもの（Express の型に依存しないため） */
interface JsonResponse {
  status(code: number): { json(body: ErrorResponseBody): void };
}

/**
 * 責務: アプリで投げられたすべての例外を、API 設計書のエラーレスポンス（ErrorResponseBody）に変換する。
 * 業務の判断はしない。「どの例外を、どのステータスと code にするか」だけを決める。
 *
 * 全体の流れ: コントローラ → ユースケース → domain のどこかで例外が投げられる
 * → Nest がこのフィルタの `catch` を呼ぶ → HTTP レスポンスを返して終わる。
 * AppModule が `APP_FILTER` として登録しているので、全エンドポイントに適用される。
 *
 * 変換の規則（上から順に判定する）:
 * - DomainError → code に対応するステータス（HTTP_STATUS_BY_ERROR_CODE）。業務上の失敗。
 * - ZodError（入力の検証に失敗）→ 400 VALIDATION_ERROR。`details` に検証エラーの一覧を入れる。
 * - Nest 自身の HttpException（存在しない URL など）→ ステータスに対応する code。5xx は 500 にまとめる。
 * - それ以外（バグ、DB 障害、`todo()` の未実装）→ 500 INTERNAL_ERROR。詳細はログにだけ出し、レスポンスには含めない。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /** Nest が例外ごとに呼ぶ。レスポンスを返したら終わりで、例外は再送出しない */
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
