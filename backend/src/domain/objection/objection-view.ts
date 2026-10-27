import type { ObjectionId, TaskId } from "../shared/ids.ts";
import type { ReasonType } from "./objection.ts";

/** 責務: 異議の表示形を定める。複数のユースケース（作成、一覧、取り下げ）が同じ形を返す。 */

/** 異議の表示用の情報。理由は、canSeeObjectionReason を満たす人にだけ返す */
export interface ObjectionSummary {
  id: ObjectionId;
  taskId: TaskId;
  round: 1 | 2;
  reasonType: ReasonType;
  reasonDetail: string | null;
  withdrawn: boolean;
  createdAt: Date;
}
