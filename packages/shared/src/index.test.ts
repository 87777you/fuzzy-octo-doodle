import assert from "node:assert/strict";
import { test } from "node:test";
import { isHealthResponse } from "./index.ts";

test("isHealthResponse accepts the health payload", () => {
  assert.equal(isHealthResponse({ status: "ok" }), true);
});

test("isHealthResponse rejects other values", () => {
  assert.equal(isHealthResponse(null), false);
  assert.equal(isHealthResponse({ status: "ng" }), false);
});
