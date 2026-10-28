import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTaskId, parseUserId } from "./domain/shared/id-parsers.ts";
import { parseStoragePath } from "./domain/shared/storage-path.ts";
import { MockPaymentGateway } from "./infrastructure/payment/mock-payment-gateway.ts";
import { MockObjectStorage } from "./infrastructure/storage/mock-object-storage.ts";

const path = parseStoragePath("tasks/abc/photo-1.jpg");

test("モックの保存先は、パスと有効期限を含む URL を返す", async () => {
  const url = await new MockObjectStorage().createSignedUploadUrl(path, 300);
  assert.equal(url, "http://localhost:8080/mock-storage/tasks/abc/photo-1.jpg?expires=300");
});

test("モックの保存先は、どのパスも存在するとして扱う", async () => {
  assert.equal(await new MockObjectStorage().exists(path), true);
});

test("モックの決済は、作成前の確認が常に成功する", async () => {
  await new MockPaymentGateway().assertCanCreateTask(parseUserId("11111111-1111-4111-8111-111111111111"));
});

test("モックの決済は、請求の依頼をログに出す", async (t) => {
  const log = t.mock.method(console, "log", () => undefined);
  await new MockPaymentGateway().requestCharge({
    taskId: parseTaskId("22222222-2222-4222-8222-222222222222"),
    userId: parseUserId("11111111-1111-4111-8111-111111111111"),
    amount: 1000,
  });
  assert.equal(log.mock.callCount(), 1);
  assert.match(String(log.mock.calls[0]?.arguments[0]), /"amount":1000/);
});
