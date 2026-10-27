import type { FriendshipId, ObjectionId, PostId, TaskId, UserId } from "../../domain/shared/ids.ts";
import type { PostType, ReactionType } from "../../domain/feed/post.ts";
import type { FriendTaskView } from "../../domain/task/task-view.ts";
import type { UserStats } from "../../domain/user/user.ts";
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

/** タイムラインの 1 件。金額は、投稿者が公開にしたタスクだけに含まれる（FriendTaskView） */
export interface FeedItemView {
  postId: PostId;
  postType: PostType;
  postedAt: Date;
  author: UserSummary;
  task: FriendTaskView;
  reactionCounts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
}

/** 自分の実績。successRate は分母が 0 のとき null */
export interface MyStats {
  stats: UserStats;
  successRate: number | null;
}

/** 定期ジョブの結果 */
export interface JobResult {
  processed: number;
}
