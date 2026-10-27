import { createApp } from "./composition/create-app.ts";

// Cloud Run などのコンテナ実行環境は PORT を注入する。
const port = Number(process.env["PORT"] ?? 8080);
const app = await createApp();

// SIGTERM / SIGINT では、createApp で有効にしたシャットダウンフックが接続を閉じる。
await app.listen(port, "0.0.0.0");
console.log(JSON.stringify({ msg: "listening", port }));
