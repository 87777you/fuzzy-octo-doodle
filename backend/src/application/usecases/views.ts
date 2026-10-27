import type { FriendshipId, ObjectionId, TaskId, UserId } from "../../domain/shared/ids.ts";
import type { ReasonType } from "../../domain/objection/objection.ts";

/** 友だち関連の画面に出す相手の情報 */
export interface UserSummary {
  userId: UserId;
  nickname: string;
}

/** フレンド申請（受信・送信どちらの一覧にも使う） */
export interface FriendRequestView {
  id: FriendshipId;
  requester: UserSummary;
  addressee: UserSummary;
  requestedAt: Date;
}

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
