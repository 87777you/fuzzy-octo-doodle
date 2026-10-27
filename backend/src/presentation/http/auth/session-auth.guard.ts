import { Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SESSION_AUTHENTICATOR } from "../../../application/ports/session.port.ts";
import type { SessionAuthenticator } from "../../../application/ports/session.port.ts";
import { todo } from "../../../application/shared/todo.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { IS_PUBLIC_KEY } from "./public.decorator.ts";

/**
 * 責務: すべてのエンドポイントに適用する認証ガード（`@Public()` を除く）。
 * 「セッション Cookie の持ち主が誰か」を確定し、確定できなければ処理を止める。権限の判定（誰が何をできるか）は担当しない。
 *
 * 全体の流れ: HTTP リクエスト → OriginGuard（CSRF）→ このガード → コントローラ。
 * AuthModule が `APP_GUARD` として登録するので、新しいコントローラでも何もせずに適用される。
 * 検証に成功すると `request.userId` が載り、`@CurrentUser()` で読める。
 *
 * 実装の流れ（認証の担当が実装する）:
 * 1. リクエストの Cookie（`SESSION_COOKIE_NAME`）を取り出す。なければ DomainError("UNAUTHENTICATED")。
 * 2. `parseSessionToken` で形式を確認する。
 * 3. `SessionAuthenticator.authenticate(token, now)` で持ち主を得る。null なら DomainError("UNAUTHENTICATED")。
 * 4. `request.userId` に載せて true を返す。
 *
 * 依存の理由: `reflector` は `@Public()` の判定、`authenticator` はセッションの検証、`clock` はセッションの有効期限の比較に使う。
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly reflector: Reflector;
  /** セッションの検証（infrastructure の実装は DbSessionAuthenticator）。実装時に使う。骨格の間は未使用 */
  protected readonly authenticator: SessionAuthenticator;
  /** 現在時刻。有効期限の判定に使う。骨格の間は未使用 */
  protected readonly clock: Clock;

  constructor(
    @Inject(Reflector) reflector: Reflector,
    @Inject(SESSION_AUTHENTICATOR) authenticator: SessionAuthenticator,
    @Inject(CLOCK) clock: Clock,
  ) {
    this.reflector = reflector;
    this.authenticator = authenticator;
    this.clock = clock;
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) return Promise.resolve(true);
    return todo("SessionAuthGuard");
  }
}
