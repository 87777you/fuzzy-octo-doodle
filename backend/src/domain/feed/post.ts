import type { PostId, TaskId, UserId } from "../shared/ids.ts";

export const POST_TYPES = ["created", "reported", "failed"] as const;
export type PostType = (typeof POST_TYPES)[number];
export const REACTION_TYPES = ["support", "fire", "congrats", "laugh"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

/** 1タスクにつき post_type ごとに1件まで（task_id, post_type が一意）。達成確定では新規投稿を作らない */
export interface Post {
  readonly id: PostId;
  readonly taskId: TaskId;
  readonly userId: UserId;
  readonly postType: PostType;
  readonly createdAt: Date;
}

export const FEED_WINDOW_DAYS = 7;
export const FEED_PAGE_SIZE = 20;
