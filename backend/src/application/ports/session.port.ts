import type { SessionToken } from "../../domain/shared/session-token.ts";
import type { UserId } from "../../domain/shared/ids.ts";

/** セッションを検証する。実装（保存先、期限、延長）は認証の担当が決める */
export interface SessionAuthenticator {
  /** 有効なセッションならその持ち主、無効（存在しない、期限切れ、失効）なら null */
  authenticate(token: SessionToken, now: Date): Promise<UserId | null>;
}
export const SESSION_AUTHENTICATOR = Symbol("SessionAuthenticator");
