import { AuthTypes, Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import { PostgresDialect } from "kysely";
import pg from "pg";

export interface CloudSqlConfig {
  /** `project:region:instance` */
  instanceConnectionName: string;
  database: string;
  /**
   * IAM データベースユーザー名。
   * サービスアカウントは末尾の `.gserviceaccount.com` を除いた `name@project.iam` 形式。
   */
  iamUser: string;
  ipType: "PUBLIC" | "PRIVATE" | "PSC";
  /** プールの最大接続数。db-f1-micro の最大接続数（約 25）を超えないこと */
  maxConnections: number;
}

export interface CloudSqlHandle {
  dialect: PostgresDialect;
  /** プールとコネクタを閉じる。プロセス終了時に呼ぶ */
  close: () => Promise<void>;
}

const IP_TYPES = {
  PUBLIC: IpAddressTypes.PUBLIC,
  PRIVATE: IpAddressTypes.PRIVATE,
  PSC: IpAddressTypes.PSC,
} as const;

/**
 * Cloud SQL for PostgreSQL へ IAM 認証で接続する Dialect を作る。
 * パスワードは使わない。コネクタが ADC（Cloud Run のサービスアカウント）から短期トークンを取得し、
 * TLS 接続もコネクタが張る。DB 製品を変える場合はこのファイルだけを差し替える。
 */
export async function createCloudSqlDialect(config: CloudSqlConfig): Promise<CloudSqlHandle> {
  const connector = new Connector();
  const options = await connector.getOptions({
    instanceConnectionName: config.instanceConnectionName,
    ipType: IP_TYPES[config.ipType],
    authType: AuthTypes.IAM,
  });
  const pool = new pg.Pool({
    ...options,
    user: config.iamUser,
    database: config.database,
    max: config.maxConnections,
  });
  return {
    dialect: new PostgresDialect({ pool }),
    close: async () => {
      await pool.end();
      connector.close();
    },
  };
}
