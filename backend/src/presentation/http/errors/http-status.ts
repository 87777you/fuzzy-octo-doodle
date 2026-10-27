import type { ErrorCode } from "../../../domain/shared/errors.ts";

/**
 * DomainError の code ごとの HTTP ステータス。Record なので、ErrorCode を増やすとここも追加しないとコンパイルできない。
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
