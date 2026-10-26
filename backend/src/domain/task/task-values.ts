import { DomainError } from "../shared/errors.ts";
import type { Brand } from "../shared/brand.ts";
import { TITLE_MAX, PENALTY_MAX, PENALTY_MIN } from "./task-policy.ts";

export type TaskTitle = Brand<string, "TaskTitle">;
export type NonEmptyText = Brand<string, "NonEmptyText">;
export type PenaltyAmount = Brand<number, "PenaltyAmount">;

export function parseTaskTitle(raw: string): TaskTitle {
  const v = raw.trim();
  if (v.length < 1 || v.length > TITLE_MAX) {
    throw new DomainError("VALIDATION_ERROR", `タイトルは1〜${String(TITLE_MAX)}文字で入力してください`);
  }
  return v as TaskTitle;
}

export function parseNonEmptyText(raw: string, label: string): NonEmptyText {
  const v = raw.trim();
  if (v.length === 0) throw new DomainError("VALIDATION_ERROR", `${label}は必須です`);
  return v as NonEmptyText;
}

export function parsePenaltyAmount(n: number): PenaltyAmount {
  if (!Number.isInteger(n) || n < PENALTY_MIN || n > PENALTY_MAX) {
    throw new DomainError(
      "VALIDATION_ERROR",
      `ペナルティ金額は${String(PENALTY_MIN)}〜${String(PENALTY_MAX)}円の整数で指定してください`,
    );
  }
  return n as PenaltyAmount;
}
