import type { ControlledTransaction } from "kysely";
import type { Tx } from "../../application/ports/unit-of-work.port.ts";
import type { Database } from "./schema.ts";

export type DbTransaction = ControlledTransaction<Database>;

/** Kysely のトランザクションを包む実体。application 層には不透明な Tx として渡る */
class KyselyTx {
  readonly transaction: DbTransaction;

  constructor(transaction: DbTransaction) {
    this.transaction = transaction;
  }
}

/**
 * application 層に渡す不透明な Tx にする。
 * Tx のブランドはポート側で非公開のため、型の上では変換が必要になる。変換するのはここだけ。
 */
export function wrapTx(trx: DbTransaction): Tx {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Tx のブランドはポート側で非公開のため、実装クラスから Tx への変換が必要。変換はここだけで、取り出す側は instanceof で検証する
  return new KyselyTx(trx) as unknown as Tx;
}

/** repository 実装がクエリを実行するためにハンドルを取り出す。wrapTx で作った Tx 以外は拒否する */
export function dbOf(tx: Tx): DbTransaction {
  if (!(tx instanceof KyselyTx)) {
    throw new TypeError("Tx は KyselyUnitOfWork が発行したものを使ってください");
  }
  return tx.transaction;
}
