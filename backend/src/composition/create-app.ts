import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module.ts";

/** 起動と統合テストの両方で使うアプリの組み立て。API は `/api` 配下に置く（死活監視の `/healthz` を除く） */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api", { exclude: ["healthz"] });
  app.enableShutdownHooks();
  return app;
}
