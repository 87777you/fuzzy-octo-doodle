import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { SESSION_AUTHENTICATOR } from "../application/ports/session.port.ts";
import { DbSessionAuthenticator } from "../infrastructure/auth/session-authenticator.ts";
import { OriginGuard } from "../presentation/http/auth/origin.guard.ts";
import { SessionAuthGuard } from "../presentation/http/auth/session-auth.guard.ts";
import { PersistenceModule } from "./persistence.module.ts";

/** 認証。全エンドポイントに、Origin の検証とセッションの検証を適用する（`@Public()` を除く） */
@Module({
  imports: [PersistenceModule],
  providers: [
    { provide: SESSION_AUTHENTICATOR, useClass: DbSessionAuthenticator },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
  ],
})
export class AuthModule {}
