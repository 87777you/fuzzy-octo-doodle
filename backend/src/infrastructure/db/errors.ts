import { DomainError } from "../../domain/shared/errors.ts";
import type { Tx } from "../../application/ports/unit-of-work.port.ts";
import type { Transaction } from "kysely";
import type { Database } from "./schema.ts";
import { dbOf } from "./tx.ts";

function field(e: unknown, key: string): unknown {
  if (typeof e !== "object" || e === null) return undefined;
  const value: unknown = Reflect.get(e, key);
  return value;
}

/** 一意制約違反の判定。ドライバごとのエラー形式の差をここで吸収する */
export function isUniqueViolation(e: unknown): boolean {
  const code = field(e, "code");
  const errno = field(e, "errno");
  return (
    code === "23505" || // PostgreSQL
    code === "ER_DUP_ENTRY" || // MySQL / MariaDB
    errno === 1062 || // MySQL / MariaDB
    code === "SQLITE_CONSTRAINT_UNIQUE" ||
    code === "SQLITE_CONSTRAINT_PRIMARYKEY"
  );
}

/** 一意制約違反を DomainError に変換して投げ直す */
export function rethrowAsDomain(e: unknown, message: string): never {
  if (isUniqueViolation(e)) throw new DomainError("ALREADY_EXISTS", message);
  throw e;
}

/**
 * 一意制約違反を許容する INSERT。違反したら false を返す。
 * PostgreSQL は失敗した文でトランザクション全体が中断されるため、savepoint で囲んで巻き戻す。
 * `ON CONFLICT` / `INSERT IGNORE` は製品ごとに構文が違うので使わない。
 */
export async function insertUnlessDuplicate(
  tx: Tx,
  insert: (q: Transaction<Database>) => Promise<unknown>,
): Promise<boolean> {
  const trx = dbOf(tx);
  const sp = await trx.savepoint("insert_attempt").execute();
  try {
    await insert(sp);
    await sp.releaseSavepoint("insert_attempt").execute();
    return true;
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    await sp.rollbackToSavepoint("insert_attempt").execute();
    return false;
  }
}
