import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module.ts";

/**
 * 責務: Nest アプリを組み立てて返す。起動（main.ts）と統合テスト（app.test.ts）の両方が使う。
 * 組み立てだけを行い、待ち受けの開始（listen）は呼び出し側が行う。
 *
 * 設定の理由:
 * - API は `/api` 配下に置く。Cookie の `Path=/api` と対応させ、フロントエンドと同じドメインで公開できる。
 * - `/healthz` だけ `/api` の外に置く（死活監視の経路を API と分けるため）。
 * - `enableShutdownHooks`: SIGTERM / SIGINT で `onApplicationShutdown` が呼ばれ、DB 接続を閉じてから終了する。
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api", { exclude: ["healthz"] });
  app.enableShutdownHooks();
  return app;
}
