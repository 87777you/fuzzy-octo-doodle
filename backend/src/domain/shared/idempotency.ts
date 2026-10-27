import type { Brand } from "./brand.ts";
import { DomainError } from "./errors.ts";

/** Idempotency-Key を必須とする操作。操作を増やすときはここに追加する */
export const IDEMPOTENT_OPERATIONS = [
  "create_task",
  "complete_evidence_upload",
  "create_objection",
  "withdraw_objection",
  "create_friend_request",
] as const;
export type IdempotentOperation = (typeof IDEMPOTENT_OPERATIONS)[number];

/** Idempotency-Key ヘッダの値（UUID）。parseIdempotencyKey だけが作る */
export type IdempotencyKey = Brand<string, "IdempotencyKey">;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseIdempotencyKey(raw: string): IdempotencyKey {
  if (!UUID_PATTERN.test(raw)) throw new DomainError("VALIDATION_ERROR", "Idempotency-Key は UUID で指定してください");
  return raw.toLowerCase() as IdempotencyKey;
}

/** リクエスト内容の SHA-256（16進64文字）。同じキーで別の内容が送られたことの検出に使う */
export type RequestHash = Brand<string, "RequestHash">;

export function parseRequestHash(raw: string): RequestHash {
  if (!/^[0-9a-f]{64}$/.test(raw)) throw new DomainError("VALIDATION_ERROR", "リクエストのハッシュが不正です");
  return raw as RequestHash;
}

/**
 * 保存するレスポンスのステータス。失敗した要求はトランザクションごと取り消され、記録に残らないため、
 * 成功のステータスだけを持つ。200=成功、201=作成成功、204=本文なしの成功（API 設計書のHTTPステータスに対応）。
 */
export const IDEMPOTENT_RESPONSE_STATUSES = [200, 201, 204] as const;
export type IdempotentResponseStatus = (typeof IDEMPOTENT_RESPONSE_STATUSES)[number];
