import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/public.decorator.ts";

/**
 * 責務: 死活監視用のエンドポイント `GET /healthz`。プロセスが HTTP に応答できることだけを返す。
 * DB など外部への接続は確認しない（外部の障害でコンテナが再起動され続けるのを避けるため）。
 *
 * 全体の流れ: ロードバランサやコンテナ基盤が定期的に呼ぶ。`@Public()` なので認証ガードを通らない。
 * `/api` のプレフィックスは付けない（create-app.ts で除外している）。
 */
@Public()
@Controller("healthz")
export class HealthController {
  /** 常に `{ status: "ok" }` を返す */
  @Get()
  check(): { status: "ok" } {
    return { status: "ok" };
  }
}
