import { Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import type { AuthenticatedRequest } from "./authenticated-request.ts";

/** 状態を変えない HTTP メソッド。CSRF の対象にならないので、Origin の検証を省く */
const SAFE_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * 責務: CSRF 対策の 2 層目。状態を変えるリクエスト（GET / HEAD / OPTIONS 以外）の `Origin` ヘッダを検証する。
 * 1 層目は Cookie の `SameSite=Lax`（session-cookie.ts）。
 *
 * 全体の流れ: HTTP リクエスト → このガード → SessionAuthGuard → コントローラ。AuthModule が全体に適用する。
 * 認証より先に判定するので、他サイトから誘導されたリクエストは、セッションの検証まで進まない。
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
