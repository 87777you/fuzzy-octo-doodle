import type {
  IdempotencyKey,
  IdempotentOperation,
  IdempotentResponseStatus,
  RequestHash,
} from "../../domain/shared/idempotency.ts";
import type { UserId } from "../../domain/shared/ids.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface IdempotencyRecord {
  requestHash: RequestHash;
  responseStatus: IdempotentResponseStatus | null;
  responseBody: unknown; // null = 処理中 or 未完了
}

export interface IdempotencyRepository {
  /**
   * キーを予約する。新規なら null、既存ならその記録を返す。
   * 呼び出し側: hash 不一致 → IDEMPOTENCY_KEY_REUSED / 完了済み → 保存済みレスポンスを返す。
   */
  reserve(
    tx: Tx,
    user: UserId,
    operation: IdempotentOperation,
    key: IdempotencyKey,
    requestHash: RequestHash,
    now: Date,
  ): Promise<IdempotencyRecord | null>;
  complete(
    tx: Tx,
    user: UserId,
    operation: IdempotentOperation,
    key: IdempotencyKey,
    status: IdempotentResponseStatus,
    body: unknown,
  ): Promise<void>;
}
export const IDEMPOTENCY_REPOSITORY = Symbol("IdempotencyRepository");
