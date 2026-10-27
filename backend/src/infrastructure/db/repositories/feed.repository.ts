import type { Post, PostType, ReactionType } from "../../../domain/feed/post.ts";
import { REACTION_TYPES } from "../../../domain/feed/post.ts";
import type { PostId, TaskId, UserId } from "../../../domain/shared/ids.ts";
import type {
  FeedItem,
  FeedQuery,
  PostRepository,
  ReactionRepository,
} from "../../../application/ports/feed.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { Tx } from "../../../application/ports/unit-of-work.port.ts";
import { decodeCursor, toPage } from "../cursor.ts";
import { insertUnlessDuplicate } from "../errors.ts";
import { taskId as toTaskId } from "../mappers/ids.ts";
import { toNumber } from "../mappers/common.ts";
import { asReactionType, rowToPost } from "../mappers/misc.mapper.ts";
import type { PostsTable, Row } from "../schema.ts";
import { dbOf } from "../tx.ts";

async function hydrate(tx: Tx, posts: Row<PostsTable>[], viewer: UserId): Promise<FeedItem[]> {
  if (posts.length === 0) return [];
  const q = dbOf(tx);
  const ids = posts.map((p) => p.id);
  // 2 つのクエリは互いに独立しているので、先に両方を発行してから結果を待つ
  const countsQuery = q
    .selectFrom("reactions")
    .select(["post_id", "reaction_type"])
    .select((eb) => eb.fn.countAll<string | number | bigint>().as("c"))
    .where("post_id", "in", ids)
    .groupBy(["post_id", "reaction_type"])
    .execute();
  const mineQuery = q
    .selectFrom("reactions")
    .select(["post_id", "reaction_type"])
    .where("post_id", "in", ids)
    .where("user_id", "=", viewer)
    .execute();
  const [counts, mine] = await Promise.all([countsQuery, mineQuery]);
  return posts.map((p) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Object.fromEntries は Record<string, number> を返す。キーは REACTION_TYPES の全要素で、Record<ReactionType, number> と一致する
    const reactionCounts = Object.fromEntries(REACTION_TYPES.map((t) => [t, 0])) as Record<ReactionType, number>;
    for (const c of counts) if (c.post_id === p.id) reactionCounts[asReactionType(c.reaction_type)] = toNumber(c.c);
    const m = mine.find((r) => r.post_id === p.id);
    return {
      post: rowToPost(p),
      taskId: toTaskId(p.task_id),
      reactionCounts,
      myReaction: m === undefined ? null : asReactionType(m.reaction_type),
    };
  });
}

export class KyselyPostRepository implements PostRepository {
  async insertIfAbsent(tx: Tx, post: Post): Promise<void> {
    await insertUnlessDuplicate(tx, (q) =>
      q
        .insertInto("posts")
        .values({
          id: post.id,
          task_id: post.taskId,
          user_id: post.userId,
          post_type: post.postType,
          created_at: post.createdAt,
        })
        .execute(),
    );
  }

  async findById(tx: Tx, id: PostId): Promise<Post | null> {
    const row = await dbOf(tx).selectFrom("posts").selectAll().where("id", "=", id).executeTakeFirst();
    return row === undefined ? null : rowToPost(row);
  }

  async hasPost(tx: Tx, taskId: TaskId, type: PostType): Promise<boolean> {
    const row = await dbOf(tx)
      .selectFrom("posts")
      .select("id")
      .where("task_id", "=", taskId)
      .where("post_type", "=", type)
      .executeTakeFirst();
    return row !== undefined;
  }

  async listFeed(tx: Tx, q: FeedQuery): Promise<Page<FeedItem>> {
    let qb = dbOf(tx)
      .selectFrom("posts")
      .selectAll("posts")
      .where((eb) =>
        eb.or([
          eb(
            "posts.user_id",
            "in",
            eb.selectFrom("friendships").select("receiver_id").where("requester_id", "=", q.viewer).where("status", "=", "accepted"),
          ),
          eb(
            "posts.user_id",
            "in",
            eb.selectFrom("friendships").select("requester_id").where("receiver_id", "=", q.viewer).where("status", "=", "accepted"),
          ),
        ]),
      );
    qb =
      q.filter === "all"
        ? qb.where("posts.created_at", ">=", q.since)
        : qb.where((eb) =>
            eb("posts.task_id", "in", eb.selectFrom("task_objections").select("task_id").where("user_id", "=", q.viewer)),
          );
    if (q.cursor !== undefined) {
      const c = decodeCursor(q.cursor);
      qb = qb.where((eb) =>
        eb.or([eb("posts.created_at", "<", c.at), eb.and([eb("posts.created_at", "=", c.at), eb("posts.id", "<", c.id)])]),
      );
    }
    const rows = await qb.orderBy("posts.created_at", "desc").orderBy("posts.id", "desc").limit(q.limit + 1).execute();
    const hasMore = rows.length > q.limit;
    const slice = hasMore ? rows.slice(0, q.limit) : rows;
    const items = await hydrate(tx, slice, q.viewer);
    const page = toPage(slice, q.limit, (r) => r.id, (r) => ({ at: r.created_at, id: r.id }));
    return { items, nextCursor: hasMore ? page.nextCursor : null };
  }

  async findFeedItem(tx: Tx, id: PostId, viewer: UserId): Promise<FeedItem | null> {
    const row = await dbOf(tx)
      .selectFrom("posts")
      .selectAll("posts")
      .where("posts.id", "=", id)
      .where((eb) =>
        eb.or([
          eb("posts.user_id", "=", viewer),
          eb(
            "posts.user_id",
            "in",
            eb.selectFrom("friendships").select("receiver_id").where("requester_id", "=", viewer).where("status", "=", "accepted"),
          ),
          eb(
            "posts.user_id",
            "in",
            eb.selectFrom("friendships").select("requester_id").where("receiver_id", "=", viewer).where("status", "=", "accepted"),
          ),
        ]),
      )
      .executeTakeFirst();
    if (row === undefined) return null;
    const [item] = await hydrate(tx, [row], viewer);
    return item ?? null;
  }
}

export class KyselyReactionRepository implements ReactionRepository {
  async upsert(tx: Tx, postId: PostId, user: UserId, type: ReactionType, now: Date): Promise<void> {
    const q = dbOf(tx);
    const existing = await q
      .selectFrom("reactions")
      .select("id")
      .where("post_id", "=", postId)
      .where("user_id", "=", user)
      .forUpdate()
      .executeTakeFirst();
    if (existing === undefined) {
      await q
        .insertInto("reactions")
        .values({
          id: `${postId}:${user}`,
          post_id: postId,
          user_id: user,
          reaction_type: type,
          created_at: now,
          updated_at: now,
        })
        .execute();
    } else {
      await q.updateTable("reactions").set({ reaction_type: type, updated_at: now }).where("id", "=", existing.id).execute();
    }
  }

  async remove(tx: Tx, postId: PostId, user: UserId): Promise<void> {
    await dbOf(tx).deleteFrom("reactions").where("post_id", "=", postId).where("user_id", "=", user).execute();
  }
}
