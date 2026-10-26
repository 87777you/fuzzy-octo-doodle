import { DomainError } from "../shared/errors.ts";
import type { Brand } from "../shared/brand.ts";
import type { UserId } from "../shared/ids.ts";

export const NICKNAME_MAX = 20;

export type Nickname = Brand<string, "Nickname">;

export type User = Readonly<{
  id: UserId;
  nickname: Nickname;
  createdAt: Date;
  updatedAt: Date;
}>;

export function parseNickname(raw: string): Nickname {
  const v = raw.trim();
  if (v.length < 1 || v.length > NICKNAME_MAX) {
    throw new DomainError(
      "VALIDATION_ERROR",
      `ニックネームは1〜${String(NICKNAME_MAX)}文字で入力してください`,
    );
  }
  return v as Nickname;
}

export function registerUser(id: UserId, nickname: string, now: Date): User {
  return { id, nickname: parseNickname(nickname), createdAt: now, updatedAt: now };
}

export function changeNickname(user: User, nickname: string, now: Date): User {
  return { ...user, nickname: parseNickname(nickname), updatedAt: now };
}

export interface UserStats {
  successCount: number;
  failedCount: number;
  indeterminateCount: number;
}

/** 達成率 = 達成 ÷ (達成 + 未達成) × 100。判定不能は対象外。分母0なら null（UIは「—」） */
export function successRate(s: UserStats): number | null {
  const denom = s.successCount + s.failedCount;
  return denom === 0 ? null : Math.round((s.successCount / denom) * 100);
}
