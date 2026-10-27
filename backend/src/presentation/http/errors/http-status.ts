import type { ErrorCode } from "../../../domain/shared/errors.ts";

/**
 * 責務: domain / application が投げる `DomainError.code` を、HTTP ステータスに対応づける表。
 *
 * 全体の流れ: ユースケースや domain が `DomainError(code, ...)` を投げる
 * → AllExceptionsFilter がこの表で HTTP ステータスを決める → レスポンスにする。
 * domain と application は HTTP を知らないので、この対応は presentation 層（ここ）だけが持つ。
 *
 * 型による保証: `Record<ErrorCode, number>` なので、`ErrorCode` に値を足すと、ここにも足さない限りコンパイルできない。
 * 対応表は docs/backend-architecture.md の「エラーの扱い」と同じ。
 */
export const HTTP_STATUS_BY_ERROR_CODE = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  STATE_CONFLICT: 409,
  IDEMPOTENCY_KEY_REUSED: 409,
  DEADLINE_EXPIRED: 422,
  TOO_MANY_ACTIVE_TASKS: 422,
  INVALID_EVIDENCE_COUNT: 422,
  PAYMENT_REQUIRED: 422,
  TEMPORARILY_UNAVAILABLE: 503,
} as const satisfies Record<ErrorCode, number>;
