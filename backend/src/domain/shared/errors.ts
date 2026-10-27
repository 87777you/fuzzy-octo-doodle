export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "STATE_CONFLICT"
  | "IDEMPOTENCY_KEY_REUSED"
  | "DEADLINE_EXPIRED"
  | "TOO_MANY_ACTIVE_TASKS"
  | "INVALID_EVIDENCE_COUNT"
  | "PAYMENT_REQUIRED"
  | "TEMPORARILY_UNAVAILABLE";

/** HTTP ステータスへの対応は presentation 層の例外フィルタで行う（domain は HTTP を知らない） */
export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
