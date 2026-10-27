import { DomainError } from "../../../domain/shared/errors.ts";
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

/** DB の値を、domain の検証関数（parse*）で型付き値にする。検証に失敗した行はデータ不整合として扱う */
export function parsedColumn<T>(parse: (raw: string) => T, v: string, table: string, column: string): T {
  try {
    return parse(v);
  } catch (e) {
    if (e instanceof DomainError) throw new CorruptRowError(table, `${column} の値が不正です: ${e.message}`);
    throw e;
  }
}

export function oneOfNumber<const L extends readonly number[]>(list: L, v: number, table: string, column: string): L[number] {
  const found = list.find((x) => x === v);
  if (found === undefined) throw new CorruptRowError(table, `${column} の値が不正です: ${String(v)}`);
  return found;
}
