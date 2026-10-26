import type { User, UserStats } from "../../domain/user/user.ts";
import type { UserId } from "../../domain/shared/ids.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface UserRepository {
  findById(tx: Tx, id: UserId): Promise<User | null>;
  findByIds(tx: Tx, ids: readonly UserId[]): Promise<User[]>;
  save(tx: Tx, user: User): Promise<void>; // upsert
  /** tasks から集計（success / failed / indeterminate） */
  getStats(tx: Tx, id: UserId): Promise<UserStats>;
}
export const USER_REPOSITORY = Symbol("UserRepository");
