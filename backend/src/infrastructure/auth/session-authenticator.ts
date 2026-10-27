import { todo } from "../../application/shared/todo.ts";
import type { SessionAuthenticator } from "../../application/ports/session.port.ts";
import type { UserId } from "../../domain/shared/ids.ts";
import type { SessionToken } from "../../domain/shared/session-token.ts";

/**
 * セッションの検証。認証の担当が実装する（保存先、有効期限、延長の方式は未定）。
 * 方針: サーバー側セッション。Cookie にはランダムなセッション ID だけを入れ、リフレッシュトークンは使わない。
 */
export class DbSessionAuthenticator implements SessionAuthenticator {
  authenticate(_token: SessionToken, _now: Date): Promise<UserId | null> {
    return todo("DbSessionAuthenticator.authenticate");
  }
}
