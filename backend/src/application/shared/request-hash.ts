import { createHash } from "node:crypto";
import { canonicalize } from "json-canonicalize";
import type { IdempotentOperation, RequestHash } from "../../domain/shared/idempotency.ts";
import { parseRequestHash } from "../../domain/shared/idempotency.ts";
import type { RequestPayloads } from "../../domain/shared/request-payloads.ts";

/**
 * 責務: 冪等性の対象になる 5 つの操作について、「リクエストの内容」から `RequestHash` を作る。
 * RequestHash を作ってよい場所は、この関数だけである（`parseRequestHash` は形式の確認用で、計算はしない）。
 * 計算が 1 か所なので、同じ内容から別の値ができる事故（項目の並び、省略の扱い、書式の違い）を防げる。
 *
 * 何のための値か: 同じ `Idempotency-Key` で別の内容が送られたことを検出する。
 * 全体の流れ: ユースケースの冒頭で `hashRequest` を呼ぶ → `IdempotencyRepository.reserve` に渡す
 * → 同じキーの記録があれば、保存済みのハッシュと比べる（違えば IDEMPOTENCY_KEY_REUSED、同じなら保存済みのレスポンスを返す）。
 *
 * 計算の規則（変えると、すでに保存された記録と一致しなくなる。変更は互換性の判断が要る）:
 * 1. 入力は `{ operation, payload }` の JSON とする。
 * 2. JSON は RFC 8785（JSON Canonicalization Scheme）で正規化する。キーの並び、空白、数値の書式が違っても同じ文字列になる。
 * 3. 使わない・無い値は `null` で表す。省略（undefined）にはしない。型でも `undefined` を禁じている。
 * 4. UTF-8 の SHA-256 を 16 進 64 文字にする。
 *
 * ペイロードに含めるもの・含めないもの（型 `RequestPayloads`（domain/shared/request-payloads.ts）が、操作ごとに許可する項目を決めている）:
 * - 含める: その操作の意味を決める入力（対象の ID、本文の項目）。
 * - 含めない: `Idempotency-Key` 自体、利用者 ID（保存先のキーに含まれる）、時刻、乱数など、再送で変わりうる値。
 * - 文字列は加工しない（トリムや大文字小文字の変換をしない）。加工は、検証や保存の側の責務である。
 */

/** 操作と、その操作のペイロードから RequestHash を作る。同じ内容なら、いつ・どこで呼んでも同じ値になる */
export function hashRequest<O extends IdempotentOperation>(operation: O, payload: RequestPayloads[O]): RequestHash {
  const canonical = canonicalize({ operation, payload });
  return parseRequestHash(createHash("sha256").update(canonical, "utf8").digest("hex"));
}
