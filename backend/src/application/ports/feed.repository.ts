import type { Post, PostType, ReactionType } from "../../domain/feed/post.ts";
import type { PostId, TaskId, UserId } from "../../domain/shared/ids.ts";
import type { Page } from "./task.repository.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface FeedQuery {
  viewer: UserId;
  filter: "all" | "objected"; // all: 直近7日 / objected: 自分が異議を申し立てたタスク（期間制限なし）
  cursor?: string;
  limit: number;
}

/** 読み取りモデル。タスクの現在状態は tasks から結合する。金額の公開判定は Mapper 側で行う */
export interface FeedItem {
  post: Post;
  taskId: TaskId;
  reactionCounts: Record<ReactionType, number>;
  myReaction: ReactionType | null;
}

export interface PostRepository {
  /** (task_id, post_type) 一意。既にあれば何もしない（冪等） */
  insertIfAbsent(tx: Tx, post: Post): Promise<void>;
  findById(tx: Tx, id: PostId): Promise<Post | null>;
  /** viewer の承認済みフレンドの投稿のみ。自分の投稿は含めない。新しい順 */
  listFeed(tx: Tx, q: FeedQuery): Promise<Page<FeedItem>>;
  findFeedItem(tx: Tx, id: PostId, viewer: UserId): Promise<FeedItem | null>;
  hasPost(tx: Tx, taskId: TaskId, type: PostType): Promise<boolean>;
}
export const POST_REPOSITORY = Symbol("PostRepository");

export interface ReactionRepository {
  /** (post_id, user_id) で upsert。1人1投稿1種類 */
  upsert(tx: Tx, postId: PostId, user: UserId, type: ReactionType, now: Date): Promise<void>;
  remove(tx: Tx, postId: PostId, user: UserId): Promise<void>;
}
export const REACTION_REPOSITORY = Symbol("ReactionRepository");
