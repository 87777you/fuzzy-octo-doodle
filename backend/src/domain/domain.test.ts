import assert from "node:assert/strict";
import { test } from "node:test";
import type { DomainError, FriendshipId, ObjectionId, TaskId, UploadSessionId, UserId } from "./index.ts";
import {
  Friendship,
  Objection,
  Task,
  UploadSession,
  canSeeEvidencePhotos,
  canSeePenaltyAmount,
  successRate,
} from "./index.ts";

const U = (s: string) => s as UserId;
const T = (s: string) => s as TaskId;
const t0 = new Date("2026-10-26T00:00:00Z");
const at = (min: number) => new Date(t0.getTime() + min * 60_000);

const mk = (over: Partial<Parameters<typeof Task.create>[0]> = {}) =>
  Task.create(
    {
      id: T("t1"),
      ownerId: U("owner"),
      originalTaskId: null,
      title: "x",
      achievementCondition: "c",
      evidenceMethod: "e",
      deadlineAt: at(60),
      penaltyAmount: 500,
      isPenaltyPublic: false,
      ...over,
    },
    t0,
  );
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as DomainError).code;
  }
  return "none";
};

test("作成バリデーション", () => {
  assert.equal(
    code(() => mk({ deadlineAt: at(9) })),
    "VALIDATION_ERROR",
  );
  assert.equal(
    code(() => mk({ deadlineAt: at(72 * 60 + 1) })),
    "VALIDATION_ERROR",
  );
  assert.equal(
    code(() => mk({ deadlineAt: at(10) })),
    "none",
  );
  assert.equal(
    code(() => mk({ penaltyAmount: 99 })),
    "VALIDATION_ERROR",
  );
  assert.equal(
    code(() => mk({ penaltyAmount: 10001 })),
    "VALIDATION_ERROR",
  );
});

test("フレンド0人なら即時達成", () => {
  const t = mk();
  t.submitInitialEvidence(0, at(30));
  assert.equal(t.status, "success");
});

test("フレンドありなら24h審査 → 異議なしで達成", () => {
  const t = mk();
  t.submitInitialEvidence(2, at(30));
  assert.equal(t.status, "reviewing");
  assert.equal(t.reviewRound, 1);
  assert.equal(t.closeReviewPeriod(at(30 + 24 * 60 - 1)), false);
  assert.equal(t.closeReviewPeriod(at(30 + 24 * 60)), true);
  assert.equal(t.status, "success");
});

test("異議 → 追加証拠 → 再審査 → 再異議で判定不能", () => {
  const t = mk();
  t.submitInitialEvidence(1, at(30));
  t.acceptObjection(at(40));
  assert.equal(t.status, "disputed");
  t.submitAdditionalEvidence(at(50));
  assert.equal(t.status, "reviewing");
  assert.equal(t.reviewRound, 2);
  t.acceptObjection(at(60));
  assert.equal(t.status, "indeterminate");
});

test("追加証拠未提出は判定不能（猶予セッション中は確定しない）", () => {
  const t = mk();
  t.submitInitialEvidence(1, at(30));
  t.acceptObjection(at(40));
  const limit = 40 + 24 * 60;
  assert.equal(t.expireAdditional(at(limit), false), false);
  assert.equal(t.expireAdditional(at(limit + 1), true), false);
  assert.equal(t.expireAdditional(at(limit + 1), false), true);
  assert.equal(t.status, "indeterminate");
});

test("取り下げは追加証拠前のみ、成功で即達成", () => {
  const t = mk();
  t.submitInitialEvidence(1, at(30));
  t.acceptObjection(at(40));
  const t2 = Task.reconstitute(t.snapshot());
  t.applyObjectionWithdrawal(1, at(41));
  assert.equal(t.status, "success");
  t2.submitAdditionalEvidence(at(41));
  assert.equal(
    code(() => {
      t2.applyObjectionWithdrawal(1, at(42));
    }),
    "STATE_CONFLICT",
  );
});

test("初回期限切れ: 猶予セッション中は failed にしない", () => {
  const t = mk();
  assert.equal(t.expireInitial(at(60), false), false); // ちょうどは有効
  assert.equal(t.expireInitial(at(61), true), false);
  assert.equal(t.expireInitial(at(61), false), true);
  assert.equal(t.status, "failed");
  assert.equal(t.expireInitial(at(62), false), false); // 冪等
});

test("アップロードセッション: 期限ちょうど開始OK / +5分まで完了OK", () => {
  const t = mk();
  assert.equal(
    code(() => UploadSession.start("s" as UploadSessionId, t, U("owner"), "initial", at(61))),
    "DEADLINE_EXPIRED",
  );
  const s = UploadSession.start("s1" as UploadSessionId, t, U("owner"), "initial", at(60));
  const ok = ["evidence/t1/s1/1.jpg"];
  assert.equal(
    code(() => {
      s.assertCompletable(U("owner"), ok, at(65));
    }),
    "none",
  );
  assert.equal(
    code(() => {
      s.assertCompletable(U("owner"), ok, at(65.1));
    }),
    "DEADLINE_EXPIRED",
  );
  assert.equal(
    code(() => {
      s.assertCompletable(U("owner"), [], at(61));
    }),
    "INVALID_EVIDENCE_COUNT",
  );
  assert.equal(
    code(() => {
      s.assertCompletable(U("owner"), ["evidence/other/x.jpg"], at(61));
    }),
    "VALIDATION_ERROR",
  );
});

test("可視性", () => {
  assert.equal(canSeePenaltyAmount("friend", false), false);
  assert.equal(canSeePenaltyAmount("friend", true), true);
  assert.equal(canSeeEvidencePhotos("friend", "reviewing"), true);
  assert.equal(canSeeEvidencePhotos("friend", "disputed"), true);
  assert.equal(canSeeEvidencePhotos("friend", "success"), false);
  assert.equal(canSeeEvidencePhotos("owner", "success"), true);
});

test("フレンド関係", () => {
  const id = (s: string) => s as FriendshipId;
  const f = Friendship.request(id("f"), U("a"), U("b"), null, t0);
  assert.equal(
    code(() => Friendship.request(id("x"), U("b"), U("a"), f, t0)),
    "ALREADY_EXISTS",
  );
  assert.equal(
    code(() => {
      f.accept(U("a"), t0);
    }),
    "FORBIDDEN",
  );
  f.reject(U("b"));
  const f2 = Friendship.request(id("y"), U("b"), U("a"), f, t0); // 再申請は同じ行を再利用
  assert.equal(f2.id, id("f"));
  f2.accept(U("a"), t0);
  f2.block(U("a"));
  assert.equal(
    code(() => Friendship.request(id("z"), U("b"), U("a"), f2, t0)),
    "FORBIDDEN",
  );
  assert.equal(
    code(() => {
      f2.unblock(U("b"));
    }),
    "STATE_CONFLICT",
  );
  f2.unblock(U("a"));
  assert.equal(f2.status, "removed");
});

test("異議と達成率", () => {
  const o = Objection.create(
    {
      id: "o" as ObjectionId,
      taskId: T("t"),
      objectorId: U("b"),
      reviewRound: 1,
      reasonType: "other",
      reasonDetail: " d ",
    },
    t0,
  );
  assert.equal(
    code(() => {
      o.withdraw(U("c"), t0);
    }),
    "FORBIDDEN",
  );
  assert.equal(successRate({ successCount: 0, failedCount: 0, indeterminateCount: 5 }), null);
  assert.equal(successRate({ successCount: 4, failedCount: 1, indeterminateCount: 9 }), 80);
});
