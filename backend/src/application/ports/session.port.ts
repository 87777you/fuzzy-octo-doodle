import type { SessionToken } from "../../domain/shared/session-token.ts";
import type { UserId } from "../../domain/shared/ids.ts";

/**
 * 責務: セッションの検証を application に対して表す port（インターフェース）。
 * 保存先、有効期限、期限の延長といった方式は実装（認証の担当）が決める。application と presentation は方式を知らない。
 *
 * 全体の流れ: SessionAuthGuard → この port → infrastructure の DbSessionAuthenticator → DB。
 * 束縛は AuthModule（`SESSION_AUTHENTICATOR` トークン）。
 */
export interface SessionAuthenticator {
  /**
   * セッションを検証する。
   * @param token 形式を確認済みのセッション ID
   * @param now 現在時刻。有効期限の判定に使う（Clock から得た値を渡す）
   * @returns 有効なセッションならその持ち主。無効（存在しない、期限切れ、失効）なら null。例外は投げない
   */
  authenticate(token: SessionToken, now: Date): Promise<UserId | null>;
}
/** 実行時の DI トークン。TypeScript の interface は実行時に消えるため、束縛と注入にはこの Symbol を使う */
export const SESSION_AUTHENTICATOR = Symbol("SessionAuthenticator");
