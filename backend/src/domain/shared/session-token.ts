import type { Brand } from "./brand.ts";
import { brandAs } from "./brand.ts";
import { DomainError } from "./errors.ts";

/**
 * 責務: Cookie から取り出したセッション ID が「セッション ID として使える形式」であることを型で表す。
 * 存在するか・期限内かの確認は含まない（それは SessionAuthenticator の責務）。
 *
 * 全体の流れ: SessionAuthGuard が Cookie の値を `parseSessionToken` に通す → SessionAuthenticator.authenticate に渡す。
 * 型は名目型なので、`parseSessionToken` を通さない文字列は authenticate に渡せない。
 */
export type SessionToken = Brand<string, "SessionToken">;

/** 英数字・`_`・`-` の 16〜256 文字（base64url で作った乱数を想定）。DB に送る前に、異常な入力を落とす */
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;

/**
 * Cookie の値を SessionToken にする。形式が合わなければ DomainError("UNAUTHENTICATED")。
 * 存在や有効期限の確認は別の層の責務。
 */
export function parseSessionToken(raw: string): SessionToken {
  if (!SESSION_TOKEN_PATTERN.test(raw)) throw new DomainError("UNAUTHENTICATED", "セッションが不正です");
  return brandAs<"SessionToken">()(raw);
}
