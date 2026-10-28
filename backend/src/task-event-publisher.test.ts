import assert from "node:assert/strict";
import { test } from "node:test";
import type { Clock } from "./application/ports/clock.port.ts";
import type { PostRepository } from "./application/ports/feed.repository.ts";
import type { IdGenerator } from "./application/ports/id-generator.port.ts";
import type { Tx } from "./application/ports/unit-of-work.port.ts";
import { TaskEventPublisher } from "./application/shared/task-event-publisher.ts";
import type { Post } from "./domain/feed/post.ts";
import { parseTaskId, parseUserId } from "./domain/shared/id-parsers.ts";
import type { TaskEvent } from "./domain/task/task-events.ts";

const taskId = parseTaskId("22222222-2222-4222-8222-222222222222");
const ownerId = parseUserId("11111111-1111-4111-8111-111111111111");
const now = new Date("2026-10-28T00:00:00Z");

// Tx は実装（infrastructure）だけが作れる不透明な型で、テストでは中身を使わない。型を満たす値を作るためだけに断言する。
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const tx = {} as Tx;

/** 保存された投稿を覚えるだけの PostRepository。`(task_id, post_type)` が一意な点も本物と同じにする */
class FakePosts implements PostRepository {
  readonly saved: Post[] = [];
  insertIfAbsent(_tx: Tx, post: Post): Promise<void> {
    if (!this.saved.some((p) => p.taskId === post.taskId && p.postType === post.postType)) this.saved.push(post);
    return Promise.resolve();
  }
  findById(): Promise<Post | null> {
    return Promise.reject(new Error("使わない"));
  }
  listFeed(): never {
    throw new Error("使わない");
  }
  findFeedItem(): never {
    throw new Error("使わない");
  }
  hasPost(): never {
    throw new Error("使わない");
  }
}

let counter = 0;
const ids: IdGenerator = {
  uuid: () => `00000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`,
  inviteToken: () => "使わない",
};
const clock: Clock = { now: () => now };

function setup(): { posts: FakePosts; publisher: TaskEventPublisher } {
  const posts = new FakePosts();
  return { posts, publisher: new TaskEventPublisher(posts, ids, clock) };
}

const base = { taskId, ownerId };

test("TaskCreated は created、InitialEvidenceSubmitted は reported、失敗の確定は failed の投稿になる", async () => {
  const { posts, publisher } = setup();
  const events: TaskEvent[] = [
    { type: "TaskCreated", ...base },
    { type: "InitialEvidenceSubmitted", reviewStarted: true, ...base },
  ];
  await publisher.publish(tx, events);
  await publisher.publish(tx, [{ type: "TaskFinalized", result: "failed", ...base }]);
  assert.deepEqual(
    posts.saved.map((p) => p.postType),
    ["created", "reported", "failed"],
  );
  assert.ok(posts.saved.every((p) => p.taskId === taskId && p.userId === ownerId && p.createdAt === now));
});

test("投稿にならないイベントは何も保存しない（エラーにもしない）", async () => {
  const { posts, publisher } = setup();
  await publisher.publish(tx, [
    { type: "AdditionalEvidenceSubmitted", ...base },
    { type: "ObjectionAccepted", round: 1, ...base },
    { type: "ObjectionWithdrawn", ...base },
    { type: "TaskFinalized", result: "success", ...base },
    { type: "TaskFinalized", result: "indeterminate", ...base },
  ]);
  assert.equal(posts.saved.length, 0);
});

test("同じイベントを 2 回渡しても、投稿は 1 件のまま", async () => {
  const { posts, publisher } = setup();
  const events: TaskEvent[] = [{ type: "TaskCreated", ...base }];
  await publisher.publish(tx, events);
  await publisher.publish(tx, events);
  assert.equal(posts.saved.length, 1);
});

test("イベントが空なら何もしない", async () => {
  const { posts, publisher } = setup();
  await publisher.publish(tx, []);
  assert.equal(posts.saved.length, 0);
});
