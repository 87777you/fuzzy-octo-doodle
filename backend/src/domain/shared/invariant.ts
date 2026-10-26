import { DomainError } from "./errors.ts";

/** 状態遷移の前提として必ず存在するはずの値を取り出す。欠けていればデータ不整合として STATE_CONFLICT を投げる */
export function required<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw new DomainError("STATE_CONFLICT", `${name} が設定されていません`);
  }
  return value;
}
