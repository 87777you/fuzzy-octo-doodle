import type { Brand } from "./brand.ts";
import { brandAs } from "./brand.ts";
import { DomainError } from "./errors.ts";

/** セッション Cookie の値（形式を確認済み）。parseSessionToken だけが作る */
export type SessionToken = Brand<string, "SessionToken">;

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;

/** Cookie の値が、セッション ID として使える形式であることを確認する。存在や有効期限の確認は別の層の責務 */
export function parseSessionToken(raw: string): SessionToken {
  if (!SESSION_TOKEN_PATTERN.test(raw)) throw new DomainError("UNAUTHENTICATED", "セッションが不正です");
  return brandAs<"SessionToken">()(raw);
}
