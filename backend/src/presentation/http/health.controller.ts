import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/public.decorator.ts";

/** 死活監視用。認証なし。グローバルプレフィックス `/api` の対象外（create-app で除外している） */
@Public()
@Controller("healthz")
export class HealthController {
  @Get()
  check(): { status: "ok" } {
    return { status: "ok" };
  }
}
