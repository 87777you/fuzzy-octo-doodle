import type { UserStats } from "./user.ts";

/** 責務: 自分の実績の表示形を定める。 */

/** 自分の実績。successRate は分母が 0 のとき null */
export interface MyStats {
  stats: UserStats;
  successRate: number | null;
}
