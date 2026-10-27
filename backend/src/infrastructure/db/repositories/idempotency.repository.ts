import { IDEMPOTENT_RESPONSE_STATUSES, parseRequestHash } from "../../../domain/shared/idempotency.ts";
import type {
  IdempotencyKey,
  IdempotentOperation,
  IdempotentResponseStatus,
  RequestHash,
} from "../../../domain/shared/idempotency.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type {
  IdempotencyRecord,
  IdempotencyRepository,
} from "../../../application/ports/idempotency.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { insertUnlessDuplicate } from "../errors.ts";
import { oneOfNumber, parsedColumn } from "../mappers/common.ts";
import { dbOf } from "../tx.ts";

export class KyselyIdempotencyRepository implements IdempotencyRepository {
  /**
   * 同じキーを同時に予約すると、後続の INSERT は先行トランザクションの完了まで待たされる（一意インデックスの行ロック）。
   * 先行がコミットすれば一意制約違反となり、保存済みの記録を返す。
   */
  async reserve(
    tx: Tx,
    user: UserId,
    operation: IdempotentOperation,
    key: IdempotencyKey,
    requestHash: RequestHash,
    now: Date,
  ): Promise<IdempotencyRecord | null> {
    const inserted = await insertUnlessDuplicate(tx, (q) =>
      q
        .insertInto("idempotency_requests")
        .values({
          id: `${user}:${operation}:${key}`,
          user_id: user,
          operation,
          idempotency_key: key,
          request_hash: requestHash,
          response_status: null,
          response_body: null,
          created_at: now,
        })
        .execute(),
    );
    if (inserted) return null;
    const row = await dbOf(tx)
      .selectFrom("idempotency_requests")
      .selectAll()
      .where("user_id", "=", user)
      .where("operation", "=", operation)
      .where("idempotency_key", "=", key)
      .executeTakeFirst();
    if (row === undefined) return null;
    const body: unknown = row.response_body === null ? null : JSON.parse(row.response_body);
    const table = "idempotency_requests";
    return {
      requestHash: parsedColumn(parseRequestHash, row.request_hash, table, "request_hash"),
      responseStatus:
        row.response_status === null
          ? null
          : oneOfNumber(IDEMPOTENT_RESPONSE_STATUSES, row.response_status, table, "response_status"),
      responseBody: body,
    };
  }

  async complete(
    tx: Tx,
    user: UserId,
    operation: IdempotentOperation,
    key: IdempotencyKey,
    status: IdempotentResponseStatus,
    body: unknown,
  ): Promise<void> {
    await dbOf(tx)
      .updateTable("idempotency_requests")
      .set({ response_status: status, response_body: JSON.stringify(body) })
      .where("user_id", "=", user)
      .where("operation", "=", operation)
      .where("idempotency_key", "=", key)
      .execute();
  }
}
