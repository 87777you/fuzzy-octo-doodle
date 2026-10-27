import type { PostId } from "../shared/ids.ts";
import type { UserSummary } from "../friendship/friend-views.ts";
import type { FriendTaskView } from "../task/task-view.ts";
import type { PostType, ReactionType } from "./post.ts";

/**
 * 責務: タイムラインに出す 1 件の表示形を定める。タイムラインの一覧と、投稿 1 件の取得の 2 つのユースケースが同じ形を返す。
 */

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
