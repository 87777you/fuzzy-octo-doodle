import { Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import type { AuthenticatedRequest } from "./authenticated-request.ts";

const SAFE_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF 対策。状態を変えるリクエスト（GET / HEAD / OPTIONS 以外）の `Origin` ヘッダを検証する。
 *
 * 実装の流れ（認証の担当が実装する）:
 * 1. `Origin` が許可するオリジン（環境変数で指定）と一致するか確認する。
 * 2. なければ（古いクライアントなど）`Referer` のオリジンで代用するか、拒否するかを決める。
 * 3. 一致しなければ DomainError("FORBIDDEN")。
 */
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (SAFE_METHODS.has(request.method)) return true;
    return todo("OriginGuard");
  }
}
