import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { SESSION_AUTHENTICATOR } from "../application/ports/session.port.ts";
import { DbSessionAuthenticator } from "../infrastructure/auth/session-authenticator.ts";
import { OriginGuard } from "../presentation/http/auth/origin.guard.ts";
import { SessionAuthGuard } from "../presentation/http/auth/session-auth.guard.ts";
import { PersistenceModule } from "./persistence.module.ts";

/**
 * 責務: 認証まわりの DI の登録。セッション検証の実装を束縛し、2 つのガードを全エンドポイントに適用する。
 *
 * 全体の流れ: リクエスト → OriginGuard → SessionAuthGuard → コントローラ。
 * `APP_GUARD` で登録したガードは、機能モジュール（tasks など）のコントローラにも適用される。
 * 登録の順がガードの実行順になるため、OriginGuard を先に置いている。
 * `@Public()` が付いたエンドポイントだけ、SessionAuthGuard が検証を省く（OriginGuard は省かない）。
 */
@Module({
  imports: [PersistenceModule],
  providers: [
    { provide: SESSION_AUTHENTICATOR, useClass: DbSessionAuthenticator },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
  ],
})
export class AuthModule {}
