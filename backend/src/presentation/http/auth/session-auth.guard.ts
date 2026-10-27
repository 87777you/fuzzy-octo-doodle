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
 * すべてのエンドポイントに適用する認証ガード（`@Public()` を除く）。
 *
 * 実装の流れ（認証の担当が実装する）:
 * 1. リクエストの Cookie（`SESSION_COOKIE_NAME`）を取り出す。なければ DomainError("UNAUTHENTICATED")。
 * 2. `parseSessionToken` で形式を確認する。
 * 3. `SessionAuthenticator.authenticate(token, now)` で持ち主を得る。null なら DomainError("UNAUTHENTICATED")。
 * 4. `request.userId` に載せて true を返す。
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly reflector: Reflector;
  /** 実装時に使う。skeleton の間は未使用 */
  protected readonly authenticator: SessionAuthenticator;
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
