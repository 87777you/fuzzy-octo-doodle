import type { FriendshipId, ObjectionId, TaskId, UserId } from "../../domain/shared/ids.ts";
import type { ReasonType } from "../../domain/objection/objection.ts";

/**
 * 責務: 複数のユースケースが返す「画面に出す形」の型を置く。domain の型（User など）をそのまま返さず、
 * 画面に必要な情報だけに絞った型を application が定める。コントローラはこの型をそのままレスポンスにする。
 *
 * 全体の流れ: ユースケースの `Output` → コントローラ → JSON。1 つのユースケースだけが使う型は、そのユースケースのファイルに置く。
 */

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
