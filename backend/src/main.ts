import { createApp } from "./app.ts";

// Cloud Run などのコンテナ実行環境は PORT を注入する。
const port = Number(process.env.PORT ?? 8080);
const server = createApp();

server.listen(port, "0.0.0.0", () => {
  console.log(JSON.stringify({ msg: "listening", port }));
});

// コンテナ停止シグナルで接続を閉じてから終了する。
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
