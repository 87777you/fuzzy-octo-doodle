import assert from "node:assert/strict";
import test from "node:test";
import {
  TASK_DRAFT_STORAGE_KEY,
  TASK_IDEMPOTENCY_KEY_STORAGE_KEY,
  buildTaskCreatePayload,
  isTaskDraft,
  submitTaskDraft,
  validateTaskDraft,
  type TaskCreateResponse,
  type TaskDraft,
} from "./taskDraft.ts";

const NOW = new Date(2026, 10, 6, 12, 0, 0, 0).getTime();
const UUID_1 = "b82f8448-a09e-4ef6-a851-b82ccbddaf20";
const UUID_2 = "3b0dc2a5-9449-4d9f-a67d-dcc99af13e31";

function localDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

function draft(overrides: Partial<TaskDraft> = {}): TaskDraft {
  return {
    title: "  読書をする  ",
    description: "  10ページ読む  ",
    deadline: localDateTime(NOW + 60 * 60_000),
    reward: "100",
    visibility: "private",
    ...overrides,
  };
}

class MemoryStorage {
  #values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value);
  }

  removeItem(key: string): void {
    this.#values.delete(key);
  }
}

function apiResponse(
  status: number,
  body: unknown,
): TaskCreateResponse {
  return {
    status,
    // eslint-disable-next-line @typescript-eslint/require-await -- mock matches async interface
    json: async () => body,
    // eslint-disable-next-line @typescript-eslint/require-await -- mock matches async interface
    text: async () => JSON.stringify(body),
  };
}

const createdResponse = () => apiResponse(201, { id: UUID_1, viewer: "owner" });

test("isTaskDraft rejects malformed data rather than trusting session storage", () => {
  assert.equal(isTaskDraft(draft()), true);
  assert.equal(isTaskDraft({ ...draft(), reward: 100 }), false);
  assert.equal(isTaskDraft({ ...draft(), visibility: "friends" }), false);
  assert.equal(isTaskDraft(null), false);
});

test("validateTaskDraft enforces trimmed title length", () => {
  assert.match(validateTaskDraft(draft({ title: "  \t " }), NOW) ?? "", /タスク名/);
  assert.equal(validateTaskDraft(draft({ title: ` ${"a".repeat(100)} ` }), NOW), null);
  assert.match(validateTaskDraft(draft({ title: "a".repeat(101) }) , NOW) ?? "", /タスク名/);
});

test("validateTaskDraft enforces integer penalty boundaries", () => {
  for (const [reward, valid] of [
    ["99", false],
    ["100", true],
    ["10000", true],
    ["10001", false],
    ["100.5", false],
    ["", false],
  ] as const) {
    assert.equal(validateTaskDraft(draft({ reward }), NOW) === null, valid, reward);
  }
});

test("validateTaskDraft accepts inclusive deadline limits and rejects times outside them", () => {
  assert.equal(validateTaskDraft(draft({ deadline: localDateTime(NOW + 10 * 60_000) }), NOW), null);
  assert.match(validateTaskDraft(draft({ deadline: localDateTime(NOW + 10 * 60_000 - 1) }), NOW) ?? "", /期限/);
  assert.equal(validateTaskDraft(draft({ deadline: localDateTime(NOW + 72 * 60 * 60_000) }), NOW), null);
  assert.match(validateTaskDraft(draft({ deadline: localDateTime(NOW + 72 * 60 * 60_000 + 1) }) , NOW) ?? "", /期限/);
  assert.match(validateTaskDraft(draft({ deadline: localDateTime(NOW + 10 * 60_000) }), NOW + 1) ?? "", /期限/);
});

test("buildTaskCreatePayload trims the description and preserves visibility and local deadline", () => {
  const value = draft({ visibility: "public" });
  const payload = buildTaskCreatePayload(value);
  assert.ok(payload);

  assert.deepEqual(payload, {
    title: "読書をする",
    achievementCondition: "10ページ読む",
    evidenceMethod: "写真を1枚以上提出",
    deadlineAt: new Date(value.deadline).toISOString(),
    penaltyAmount: 100,
    isPenaltyPublic: true,
    originalTaskId: null,
  });
  const emptyDescriptionPayload = buildTaskCreatePayload(
    draft({ description: " \n\t " }),
  );
  assert.ok(emptyDescriptionPayload);
  assert.equal(emptyDescriptionPayload.achievementCondition, "写真で判定");
});

test("submitTaskDraft preserves draft and reuses the same key after an API failure", async () => {
  const storage = new MemoryStorage();
  storage.setItem(TASK_DRAFT_STORAGE_KEY, JSON.stringify(draft()));
  const keys: string[] = [];
  const outcomes = [apiResponse(503, { error: { message: "server busy" } }), createdResponse()];
  const send = (_payload: unknown, key: string) => {
    keys.push(key);
    const next = outcomes.shift();
    assert.ok(next);
    return Promise.resolve(next);
  };
  const options = { nowMs: NOW, storage, createUUID: () => UUID_1, send };

  const first = await submitTaskDraft(draft(), options);
  assert.equal(first.kind, "failed");
  assert.equal(storage.getItem(TASK_DRAFT_STORAGE_KEY), JSON.stringify(draft()));
  assert.ok(storage.getItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY));

  const second = await submitTaskDraft(draft(), options);
  assert.equal(second.kind, "created");
  assert.deepEqual(keys, [UUID_1, UUID_1]);
  assert.equal(storage.getItem(TASK_DRAFT_STORAGE_KEY), null);
  assert.equal(storage.getItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY), null);
});

test("submitTaskDraft issues a new key only when the JSON payload changes", async () => {
  const storage = new MemoryStorage();
  storage.setItem(TASK_DRAFT_STORAGE_KEY, JSON.stringify(draft()));
  const keys: string[] = [];
   
  const send = (_payload: unknown, key: string) => {
    keys.push(key);
    return Promise.resolve(apiResponse(503, { error: { message: "retry" } }));
  };
  const options = {
    nowMs: NOW,
    storage,
    createUUID: () => [UUID_1, UUID_2][keys.length] ?? UUID_2,
    send,
  };

  await submitTaskDraft(draft(), options);
  const changedDraft = draft({ title: "別のタスク" });
  storage.setItem(TASK_DRAFT_STORAGE_KEY, JSON.stringify(changedDraft));
  await submitTaskDraft(changedDraft, options);

  assert.deepEqual(keys, [UUID_1, UUID_2]);
});

test("submitTaskDraft does not send or clear state for an invalid or expired draft", async () => {
  const storage = new MemoryStorage();
  storage.setItem(TASK_DRAFT_STORAGE_KEY, "damaged draft");
  let sendCount = 0;
  const result = await submitTaskDraft(
    draft({ deadline: localDateTime(NOW + 10 * 60_000) }),
    {
      nowMs: NOW + 1,
      storage,
      createUUID: () => UUID_1,
       
      send: () => {
        sendCount += 1;
        return Promise.resolve(createdResponse());
      },
    },
  );

  assert.equal(result.kind, "invalid");
  assert.equal(sendCount, 0);
  assert.equal(storage.getItem(TASK_DRAFT_STORAGE_KEY), "damaged draft");
});

test("submitTaskDraft does not send a valid in-memory draft when stored data is corrupt", async () => {
  const storage = new MemoryStorage();
  storage.setItem(TASK_DRAFT_STORAGE_KEY, "{");
  let sendCount = 0;

  const result = await submitTaskDraft(draft(), {
    nowMs: NOW,
    storage,
    createUUID: () => UUID_1,
     
    send: () => {
      sendCount += 1;
      return Promise.resolve(createdResponse());
    },
  });

  assert.equal(result.kind, "invalid");
  assert.equal(sendCount, 0);
  assert.equal(storage.getItem(TASK_DRAFT_STORAGE_KEY), "{");
});

test("submitTaskDraft keeps state when a 201 response cannot confirm the created task", async () => {
  const storage = new MemoryStorage();
  storage.setItem(TASK_DRAFT_STORAGE_KEY, JSON.stringify(draft()));
  const result = await submitTaskDraft(draft(), {
    nowMs: NOW,
    storage,
    createUUID: () => UUID_1,
     
    send: () => Promise.resolve(apiResponse(201, { message: "not a task" })),
  });

  assert.equal(result.kind, "failed");
  assert.equal(storage.getItem(TASK_DRAFT_STORAGE_KEY), JSON.stringify(draft()));
  assert.ok(storage.getItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY));
});