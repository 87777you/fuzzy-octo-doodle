export type TaskVisibility = "private" | "public";

export interface TaskDraft {
  title: string;
  description: string;
  deadline: string;
  reward: string;
  visibility: TaskVisibility;
}

export interface TaskCreatePayload {
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  deadlineAt: string;
  penaltyAmount: number;
  isPenaltyPublic: boolean;
  originalTaskId: null;
}

export interface TaskCreateResponse {
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface TaskDraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const TASK_DRAFT_STORAGE_KEY = "task-create-draft";
export const TASK_IDEMPOTENCY_KEY_STORAGE_KEY = "task-create-idempotency-key";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIN_PENALTY = 100;
const MAX_PENALTY = 10_000;
const MIN_DEADLINE_LEAD_MS = 10 * 60_000;
const MAX_DEADLINE_LEAD_MS = 72 * 60 * 60_000;

export function isTaskDraft(value: unknown): value is TaskDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const draft = value as Record<string, unknown>;
  return (
    typeof draft["title"] === "string" &&
    typeof draft["description"] === "string" &&
    typeof draft["deadline"] === "string" &&
    typeof draft["reward"] === "string" &&
    (draft["visibility"] === "private" || draft["visibility"] === "public")
  );
}

function parseLocalDateTime(value: string): Date | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
  if (!parts) {
    return null;
  }

  const [year, month, day, hour, minute, second = "0", fraction = ""] = parts.slice(1);
  const date = new Date(value);
  const milliseconds = Number(fraction.padEnd(3, "0") || "0");
  if (
    !Number.isFinite(date.getTime()) ||
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute) ||
    date.getSeconds() !== Number(second) ||
    date.getMilliseconds() !== milliseconds
  ) {
    return null;
  }

  return date;
}

export function validateTaskDraft(draft: TaskDraft, nowMs = Date.now(), field?: "title" | "reward" | "deadline"): string | null {
  const title = draft.title.trim();
  if ((!field || field === "title") && (title.length < 1 || title.length > 100)) {
    return "タスク名は空白以外の1〜100文字で入力してください。";
  }

  const penaltyAmount = Number(draft.reward);
  if ((!field || field === "reward") && (!Number.isInteger(penaltyAmount) || penaltyAmount < MIN_PENALTY || penaltyAmount > MAX_PENALTY)) {
    return "金額は100〜10,000円の整数で入力してください。";
  }

  const deadline = parseLocalDateTime(draft.deadline);
  const lead = deadline === null ? Number.NaN : deadline.getTime() - nowMs;
  if ((!field || field === "deadline") && (!Number.isFinite(lead) || lead < MIN_DEADLINE_LEAD_MS || lead > MAX_DEADLINE_LEAD_MS)) {
    return "期限は現在から10分〜72時間の範囲で指定してください。";
  }

  return null;
}

export function buildTaskCreatePayload(draft: TaskDraft): TaskCreatePayload | null {
  const deadline = parseLocalDateTime(draft.deadline);
  const penaltyAmount = Number(draft.reward);
  if (deadline === null || !Number.isInteger(penaltyAmount)) {
    return null;
  }

  return {
    title: draft.title.trim(),
    achievementCondition: draft.description.trim() || "写真で判定",
    evidenceMethod: "写真を1枚以上提出",
    deadlineAt: deadline.toISOString(),
    penaltyAmount,
    isPenaltyPublic: draft.visibility === "public",
    originalTaskId: null,
  };
}

function isStoredKeyForPayload(value: unknown, serializedPayload: string): value is { key: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record["request"] === serializedPayload && typeof record["key"] === "string" && UUID_PATTERN.test(record["key"]);
}

function getIdempotencyKey(
  payload: TaskCreatePayload,
  storage: TaskDraftStorage,
  createUUID: () => string,
): string {
  const request = JSON.stringify(payload);
  const saved = storage.getItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY);
  if (saved !== null) {
    try {
      const parsed: unknown = JSON.parse(saved);
      if (isStoredKeyForPayload(parsed, request)) {
        return parsed.key;
      }
    } catch {
      // Replace an unreadable key record with one tied to the current request.
    }
  }

  const key = createUUID();
  if (!UUID_PATTERN.test(key)) {
    throw new Error("UUID形式のIdempotency-Keyを生成できませんでした。");
  }
  storage.setItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY, JSON.stringify({ key, request }));
  return key;
}

function isCreatedTaskResponse(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return typeof body["id"] === "string" && UUID_PATTERN.test(body["id"]) && body["viewer"] === "owner";
}

async function taskCreateError(response: TaskCreateResponse): Promise<string> {
  const fallback = `タスクを作成できませんでした（HTTP ${String(response.status)}）。`;
  const bodyText = await response.text();
  if (!bodyText) {
    return fallback;
  }

  try {
    const body: unknown = JSON.parse(bodyText);
    if (typeof body !== "object" || body === null) {
      return fallback;
    }
    const error = (body as Record<string, unknown>)["error"];
    if (typeof error !== "object" || error === null) {
      return fallback;
    }
    const message = (error as Record<string, unknown>)["message"];
    return typeof message === "string" && message.length > 0 ? message : fallback;
  } catch {
    return fallback;
  }
}

export type SubmitTaskDraftResult =
  | { kind: "created" }
  | { kind: "invalid"; message: string }
  | { kind: "failed"; message: string };

export async function submitTaskDraft(
  value: unknown,
  options: {
    storage: TaskDraftStorage;
    send: (payload: TaskCreatePayload, idempotencyKey: string) => Promise<TaskCreateResponse>;
    createUUID: () => string;
    nowMs?: number;
  },
): Promise<SubmitTaskDraftResult> {
  if (!isTaskDraft(value)) {
    return { kind: "invalid", message: "入力内容を読み込めませんでした。入力画面からやり直してください。" };
  }

  const validationError = validateTaskDraft(value, options.nowMs ?? Date.now());
  if (validationError !== null) {
    return { kind: "invalid", message: validationError };
  }

  const payload = buildTaskCreatePayload(value);
  if (payload === null) {
    return { kind: "invalid", message: "入力内容を確認できませんでした。入力画面からやり直してください。" };
  }

  try {
    const savedDraft = options.storage.getItem(TASK_DRAFT_STORAGE_KEY);
    if (savedDraft === null || savedDraft !== JSON.stringify(value)) {
      return { kind: "invalid", message: "保存された入力内容が見つかりません。入力画面からやり直してください。" };
    }

    const key = getIdempotencyKey(payload, options.storage, options.createUUID);
    const response = await options.send(payload, key);
    if (response.status !== 201) {
      return { kind: "failed", message: await taskCreateError(response) };
    }

    const body: unknown = await response.json();
    if (!isCreatedTaskResponse(body)) {
      return { kind: "failed", message: "作成結果を確認できませんでした。入力内容を保持したまま再試行してください。" };
    }

    options.storage.removeItem(TASK_DRAFT_STORAGE_KEY);
    options.storage.removeItem(TASK_IDEMPOTENCY_KEY_STORAGE_KEY);
    return { kind: "created" };
  } catch (error) {
    return {
      kind: "failed",
      message: error instanceof Error
        ? `タスクの作成に失敗しました: ${error.message}`
        : "タスクの作成に失敗しました。通信状況を確認して再度お試しください。",
    };
  }
}
