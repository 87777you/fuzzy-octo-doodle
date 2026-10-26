import type { ControlledTransaction } from "kysely";
import type { Tx } from "../../application/ports/unit-of-work.port.ts";
import type { Database } from "./schema.ts";

export type DbTransaction = ControlledTransaction<Database>;

/** application 層に渡す不透明な Tx にする。infrastructure 内でここだけが型を作る */
export function wrapTx(trx: DbTransaction): Tx {
  return trx as unknown as Tx;
}

/** repository 実装がクエリを実行するためにハンドルを取り出す */
export function dbOf(tx: Tx): DbTransaction {
  return tx as unknown as DbTransaction;
}
