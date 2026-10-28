import { Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { AuthenticatedRequest } from "./authenticated-request.ts";
import { IS_PUBLIC_KEY } from "./public.decorator.ts";

/**
 * 責務: 開発用の認証ガード。認証が必要なエンドポイントでは、常に固定の利用者としてリクエストを通す。
 * 認証方式が決まるまで、`curl` で API を試せるようにするためのもので、本物の `SessionAuthGuard` の代わりに使う。
 *
 * 全体の流れ: AuthModule が `DEV_AUTH_USER_ID` の設定を見て、本物の代わりにこれを登録する（composition/auth.module.ts）。
 * `@Public()` のエンドポイントは、本物と同じく何もせず通す。それ以外では `request.userId` に固定の利用者を載せる。
 * 以降は本物と同じで、`@CurrentUser()` がその値を読む。
 *
 * 固定の利用者は DB の `users` に存在している必要がある（外部キーのため）。compose の起動時に `backend/dev/seed.sql` で作られる。
 * 本番では有効にならない（`loadDevAuthUserId` が起動を失敗させる）。
 */
@Injectable()
export class DevAuthGuard implements CanActivate {
  private readonly reflector: Reflector;
  private readonly userId: UserId;

  constructor(@Inject(Reflector) reflector: Reflector, userId: UserId) {
    this.reflector = reflector;
    this.userId = userId;
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.userId = this.userId;
    return true;
  }
}
