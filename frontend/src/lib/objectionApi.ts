
import { z } from "zod";
import type { ObjectionDraft } from "./objectionDraft";

const objectionResponseSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  round: z.union([z.literal(1), z.literal(2)]),
  reasonType: z.enum([
    "insufficient_evidence",
    "conditions_not_met",
    "other",
  ]),
  reasonDetail: z.string().nullable(),
  withdrawn: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type ObjectionResponse = z.infer<
  typeof objectionResponseSchema
>;

export async function createObjection(
  taskId: string,
  draft: ObjectionDraft,
  idempotencyKey: string,
): Promise<ObjectionResponse> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/objections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        reasonType: draft.reasonType,
        reasonDetail: draft.reasonDetail.trim(),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "異議申し立てを送信できませんでした。もう一度お試しください。",
    );
  }

  const data: unknown = await response.json();
  return objectionResponseSchema.parse(data);
}
