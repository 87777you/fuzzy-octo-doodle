
import { z } from "zod";

const taskSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  title: z.string(),
  achievementCondition: z.string(),
  evidenceMethod: z.string(),
  deadlineAt: z.iso.datetime(),
  status: z.enum([
    "active",
    "reviewing",
    "disputed",
    "success",
    "failed",
    "indeterminate",
    "closed",
  ]),
  viewer: z.enum(["owner", "friend"]),
});

const evidenceSchema = z.object({
  evidences: z.array(
    z.object({
      submissionType: z.enum(["initial", "additional"]),
      submittedAt: z.iso.datetime(),
      photoUrls: z.array(z.url()),
    }),
  ),
});

export type ObjectionTask = z.infer<typeof taskSchema>;
export type ObjectionEvidences = z.infer<typeof evidenceSchema>;

export async function fetchObjectionTask(
  taskId: string,
  signal?: AbortSignal,
): Promise<ObjectionTask> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    { signal: signal ?? null },
  );

  if (!response.ok) {
    throw new Error("タスク情報を取得できませんでした。");
  }

  const data: unknown = await response.json();
  const result = taskSchema.safeParse(data);

  if (!result.success) {
    console.error("タスクのZod検証エラー:", result.error.issues);
    throw new Error("タスク情報の形式が正しくありません。");
  }

  return result.data;
}

export async function fetchObjectionEvidences(
  taskId: string,
  signal?: AbortSignal,
): Promise<ObjectionEvidences> {
  const response = await fetch(
  `/api/tasks/${encodeURIComponent(taskId)}/evidences`,
  { signal: signal ?? null },
);

  if (!response.ok) {
    throw new Error("証拠情報を取得できませんでした。");
  }

  const data: unknown = await response.json();
  const result = evidenceSchema.safeParse(data);

  if (!result.success) {
    console.error("証拠のZod検証エラー:", result.error.issues);
    throw new Error("証拠情報の形式が正しくありません。");
  }

  return result.data;
}
