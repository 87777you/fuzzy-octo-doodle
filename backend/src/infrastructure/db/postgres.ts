import { PostgresDialect } from "kysely";
import pg from "pg";
import { readFileSync } from "node:fs";

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  /** disable: 平文 / require: TLS（証明書は検証しない）/ verify-full: TLS + CA とホスト名を検証 */
  sslMode: "disable" | "require" | "verify-full";
  /** sslMode が verify-full のとき、サーバー証明書を検証する CA 証明書（PEM）。省略時は OS の信頼済み CA */
  sslCa?: string;
  /** プールの最大接続数 */
  maxConnections: number;
}

export interface PostgresHandle {
  dialect: PostgresDialect;
  /** プールを閉じる。プロセス終了時に呼ぶ */
  close: () => Promise<void>;
}

/**
 * 環境変数から接続設定を読む。起動時に 1 回だけ呼び、以降は検証済みの PostgresConfig を使う。
 *
 * 各項目は `NAME`（値そのもの）または `NAME_FILE`（値を書いたファイルのパス）で渡せる。
 * Kubernetes の Secret や Docker secrets をマウントする場合は `_FILE` を使う。
 * 両方指定された場合は、設定の取り違えを防ぐためエラーにする。ファイルの末尾の改行は取り除く。
 *
 * | 変数名 | 必須 | 既定値 |
 * | --- | --- | --- |
 * | DATABASE_HOST | 必須 | |
 * | DATABASE_PORT | | 5432 |
 * | DATABASE_NAME | 必須 | |
 * | DATABASE_USER | 必須 | |
 * | DATABASE_PASSWORD | 必須 | |
 * | DATABASE_SSL_MODE | | disable |
 * | DATABASE_SSL_CA（PEM。`_FILE` でパス指定も可） | | OS の信頼済み CA |
 * | DATABASE_POOL_MAX | | 10 |
 */
export function loadPostgresConfig(env: NodeJS.ProcessEnv): PostgresConfig {
  const read = (name: string): string | undefined => {
    const direct = env[name];
    const path = env[`${name}_FILE`];
    if (direct !== undefined && path !== undefined) {
      throw new Error(`${name} と ${name}_FILE は同時に指定できません`);
    }
    if (path !== undefined) return readFileSync(path, "utf8").replace(/\r?\n$/, "");
    return direct;
  };
  const required = (name: string): string => {
    const value = read(name);
    if (value === undefined || value === "") throw new Error(`${name}（または ${name}_FILE）を指定してください`);
    return value;
  };
  const integer = (name: string, fallback: number, max: number): number => {
    const raw = read(name);
    if (raw === undefined) return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`${name} は 1〜${String(max)} の整数で指定してください`);
    return value;
  };
  const sslMode = read("DATABASE_SSL_MODE") ?? "disable";
  if (sslMode !== "disable" && sslMode !== "require" && sslMode !== "verify-full") {
    throw new Error("DATABASE_SSL_MODE は disable / require / verify-full のいずれかを指定してください");
  }
  const sslCa = read("DATABASE_SSL_CA");
  return {
    host: required("DATABASE_HOST"),
    port: integer("DATABASE_PORT", 5432, 65535),
    database: required("DATABASE_NAME"),
    user: required("DATABASE_USER"),
    password: required("DATABASE_PASSWORD"),
    sslMode,
    ...(sslCa === undefined ? {} : { sslCa }),
    maxConnections: integer("DATABASE_POOL_MAX", 10, 1000),
  };
}

/**
 * PostgreSQL へ接続する Dialect を作る。接続先やクラウドの種類には依存しない。
 * DB 製品を変える場合はこのファイルだけを差し替える。
 */
export function createPostgresDialect(config: PostgresConfig): PostgresHandle {
  const ssl =
    config.sslMode === "disable"
      ? false
      : { rejectUnauthorized: config.sslMode === "verify-full", ...(config.sslCa === undefined ? {} : { ca: config.sslCa }) };
  const pool = new pg.Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl,
    max: config.maxConnections,
  });
  return {
    dialect: new PostgresDialect({ pool }),
    close: () => pool.end(),
  };
}
