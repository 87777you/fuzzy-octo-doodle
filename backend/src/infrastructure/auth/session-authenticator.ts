import { todo } from "../../application/shared/todo.ts";
import type { SessionAuthenticator } from "../../application/ports/session.port.ts";
import type { UserId } from "../../domain/shared/ids.ts";
import type { SessionToken } from "../../domain/shared/session-token.ts";

/**
 * 責務: `SessionAuthenticator` port の実装。Cookie のセッション ID から、持ち主の UserId を得る。
 * 認証の担当が実装する。ログイン方式（OAuth かメールとパスワードか）は未決定（docs/backend-architecture.md の「未決定」）。
 *
 * 方針: サーバー側セッション。Cookie にはランダムなセッション ID だけを入れ、詳細は DB 側で持つ。
 * リフレッシュトークンは使わない（フロントエンドに更新処理を持たせないため）。
 *
 * 全体の流れ: SessionAuthGuard → SessionAuthenticator port → このクラス → DB。AuthModule が束縛する。
 */
export class DbSessionAuthenticator implements SessionAuthenticator {
  /**
   * 実装の流れ: セッション ID で DB を引く → 期限と失効を `_now` と比べる → 有効なら持ち主を返し、無効なら null。
   * 期限の延長（スライディング）をするかは、認証の担当が決める。
   */
  authenticate(_token: SessionToken, _now: Date): Promise<UserId | null> {
    return todo("DbSessionAuthenticator.authenticate");
  }
}
