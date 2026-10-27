import { Kysely } from "kysely";
import type { Dialect } from "kysely";
import type { Database } from "./schema.ts";

/**
 * DB 接続の組み立て。製品固有の部分はすべて Dialect（ドライバ）に閉じ込めている。
 * 例: PostgreSQL → `new PostgresDialect({ pool })`、MariaDB/MySQL → `new MysqlDialect({ pool })`
 * PostgreSQL の接続は postgres.ts の `loadPostgresConfig` と `createPostgresDialect` で作る。
 */
export function createDatabase(dialect: Dialect): Kysely<Database> {
  return new Kysely<Database>({ dialect });
}
