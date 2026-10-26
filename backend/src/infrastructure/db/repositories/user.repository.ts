import type { UserId } from "../../../domain/shared/ids.ts";
import type { User, UserStats } from "../../../domain/user/user.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { rethrowAsDomain } from "../errors.ts";
import { toNumber } from "../mappers/common.ts";
import { rowToUser } from "../mappers/misc.mapper.ts";
import { dbOf } from "../tx.ts";

export class KyselyUserRepository implements UserRepository {
  async findById(tx: Tx, id: UserId): Promise<User | null> {
    const row = await dbOf(tx).selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
    return row === undefined ? null : rowToUser(row);
  }

  async findByIds(tx: Tx, ids: readonly UserId[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const rows = await dbOf(tx).selectFrom("users").selectAll().where("id", "in", [...ids]).execute();
    return rows.map(rowToUser);
  }

  /** 製品固有の UPSERT 構文を避け、存在確認 → UPDATE / INSERT で実装する */
  async save(tx: Tx, user: User): Promise<void> {
    const q = dbOf(tx);
    const exists = await q.selectFrom("users").select("id").where("id", "=", user.id).forUpdate().executeTakeFirst();
    try {
      if (exists === undefined) {
        await q
          .insertInto("users")
          .values({ id: user.id, nickname: user.nickname, created_at: user.createdAt, updated_at: user.updatedAt })
          .execute();
      } else {
        await q.updateTable("users").set({ nickname: user.nickname, updated_at: user.updatedAt }).where("id", "=", user.id).execute();
      }
    } catch (e) {
      rethrowAsDomain(e, "すでに登録されています");
    }
  }

  async getStats(tx: Tx, id: UserId): Promise<UserStats> {
    const rows = await dbOf(tx)
      .selectFrom("tasks")
      .select("status")
      .select((eb) => eb.fn.countAll<string | number | bigint>().as("c"))
      .where("user_id", "=", id)
      .where("status", "in", ["success", "failed", "indeterminate"])
      .groupBy("status")
      .execute();
    const count = (s: string): number => toNumber(rows.find((r) => r.status === s)?.c ?? 0);
    return { successCount: count("success"), failedCount: count("failed"), indeterminateCount: count("indeterminate") };
  }
}
