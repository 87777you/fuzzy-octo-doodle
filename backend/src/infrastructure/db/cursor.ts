import { DomainError } from "../../domain/shared/errors.ts";
import type { Page } from "../../application/ports/task.repository.ts";

export interface KeysetCursor {
  at: Date;
  id: string;
}

export function encodeCursor(c: KeysetCursor): string {
  return Buffer.from(JSON.stringify({ t: c.at.toISOString(), id: c.id })).toString("base64url");
}

export function decodeCursor(raw: string): KeysetCursor {
  try {
    const v: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof v === "object" && v !== null) {
      const { t, id } = v as Record<string, unknown>;
      if (typeof t === "string" && typeof id === "string" && !Number.isNaN(Date.parse(t))) {
        return { at: new Date(t), id };
      }
    }
  } catch {
    // 下の VALIDATION_ERROR にまとめる
  }
  throw new DomainError("VALIDATION_ERROR", "cursor が不正です");
}

/** limit + 1 件取得した行から Page を作る */
export function toPage<R, T>(rows: R[], limit: number, map: (r: R) => T, cursorOf: (r: R) => KeysetCursor): Page<T> {
  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const last = slice[slice.length - 1];
  return {
    items: slice.map(map),
    nextCursor: hasMore && last !== undefined ? encodeCursor(cursorOf(last)) : null,
  };
}
