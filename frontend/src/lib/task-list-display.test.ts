import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTaskCardDate } from "./task-list-display.ts";

test("履歴カードには作成日を付け、進行中カードは期限日時を維持する", () => {
  const createdAt = "2026-11-01T12:00:00.000Z";
  const deadlineAt = "2026-11-03T12:30:00.000Z";
  const progressDeadline = formatTaskCardDate(deadlineAt, false, true);

  assert.match(formatTaskCardDate(createdAt, true, false), /^作成日: /);
  assert.equal(
    progressDeadline,
    new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(deadlineAt),
    ),
  );
  assert.doesNotMatch(progressDeadline, /作成日/);
});
