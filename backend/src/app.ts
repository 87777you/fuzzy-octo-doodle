import { createServer } from "node:http";
import { HEALTH_PATH, type HealthResponse } from "@app/shared";

export function createApp() {
  return createServer((req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;

    if (req.method === "GET" && path === HEALTH_PATH) {
      const body: HealthResponse = { status: "ok" };
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
}
