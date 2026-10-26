import type { Flag } from "../schema.ts";

/** 読み出した行がドメインの不変条件を満たさない（データ不整合） */
export class CorruptRowError extends Error {
  constructor(table: string, detail: string) {
    super(`${table}: ${detail}`);
    this.name = "CorruptRowError";
  }
}

export const flag = (v: Flag): boolean => v === true || v === 1;

/** COUNT などで返る数値は製品により number / string / bigint になる */
export const toNumber = (v: string | number | bigint): number => Number(v);

export function nonNull<T>(v: T | null, table: string, column: string): T {
  if (v === null) throw new CorruptRowError(table, `${column} が NULL です`);
  return v;
}

export function oneOf<const L extends readonly string[]>(list: L, v: string, table: string, column: string): L[number] {
  const found = list.find((x) => x === v);
  if (found === undefined) throw new CorruptRowError(table, `${column} の値が不正です: ${v}`);
  return found;
}
