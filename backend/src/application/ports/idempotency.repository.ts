import type { UserId } from "../../domain/shared/ids.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface IdempotencyRecord {
  requestHash: string;
  responseStatus: number | null;
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
    operation: string,
    key: string,
    requestHash: string,
    now: Date,
  ): Promise<IdempotencyRecord | null>;
  complete(
    tx: Tx,
    user: UserId,
    operation: string,
    key: string,
    status: number,
    body: unknown,
  ): Promise<void>;
}
export const IDEMPOTENCY_REPOSITORY = Symbol("IdempotencyRepository");
