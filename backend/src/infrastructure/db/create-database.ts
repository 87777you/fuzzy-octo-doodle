import { Kysely } from "kysely";
import type { Dialect } from "kysely";
import type { Database } from "./schema.ts";

/**
 * DB 接続の組み立て。製品固有の部分はすべて Dialect（ドライバ）に閉じ込めている。
 * 例: PostgreSQL → `new PostgresDialect({ pool })`、MariaDB/MySQL → `new MysqlDialect({ pool })`
 * 接続プールの生成（認証・TLS・Workload Identity の短期認証情報など）は呼び出し側で行う。
 */
export function createDatabase(dialect: Dialect): Kysely<Database> {
  return new Kysely<Database>({ dialect });
}
