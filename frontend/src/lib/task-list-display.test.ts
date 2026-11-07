import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTaskCardDate, getAppliedConditionsLabel } from "./task-list-display.ts";

test("適用済みの検索語と状態を条件要約に表示する", () => {
  assert.equal(
    getAppliedConditionsLabel("朝の散歩", "完了"),
    "適用中の条件: 検索「朝の散歩」、状態「完了」",
  );
});

test("適用済み検索が空なら未適用入力を条件として表示しない", () => {
  assert.equal(getAppliedConditionsLabel(""), "適用中の条件: なし");
});

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
