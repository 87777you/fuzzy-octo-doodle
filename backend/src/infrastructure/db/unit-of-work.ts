import type { Kysely } from "kysely";
import type { Tx, UnitOfWork } from "../../application/ports/unit-of-work.port.ts";
import type { Database } from "./schema.ts";
import { wrapTx } from "./tx.ts";

export class KyselyUnitOfWork implements UnitOfWork {
  private readonly db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  async run<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    // savepoint を使うため、コールバック形式ではなく制御可能なトランザクションを使う
    const trx = await this.db.startTransaction().execute();
    try {
      const result = await fn(wrapTx(trx));
      await trx.commit().execute();
      return result;
    } catch (e) {
      await trx.rollback().execute();
      throw e;
    }
  }
}
