/**
 * 型による保証の実例。`@ts-expect-error` の行は「コンパイルできないこと」を表す。
 * 型が緩んでコンパイルできてしまうと、未使用の `@ts-expect-error` として `pnpm typecheck` が失敗する。
 * 実行されない（どこからも import されない）。
 */
import type { ObjectionId, TaskId, UploadSessionId, UserId } from "./shared/ids.ts";
import type { ActiveTask, DisputedTask, ReviewingTask, SuccessTask } from "./task/task.ts";
import { acceptFirstObjection, submitAdditionalEvidence, submitInitialEvidence } from "./task/task.ts";
import type { FriendTaskView } from "./task/task-view.ts";
import { toTaskView } from "./task/task-view.ts";
import type { Objection } from "./objection/objection.ts";
import { withdrawFirstObjection } from "./task/task.ts";
import { startAdditionalUpload } from "./evidence/upload-session.ts";
import type { PhotoPaths } from "./evidence/evidence.ts";
import type { StoragePath } from "./shared/storage-path.ts";
import type { TaskDeadline } from "./task/task-policy.ts";
import type { PhotoAccessGrant } from "./task/visibility-policy.ts";
import type { IdempotentOperation, IdempotentResponseStatus } from "../application/ports/idempotency.repository.ts";
import type { ObjectStorage } from "../application/ports/object-storage.port.ts";

function use(...values: unknown[]): number {
  return values.length;
}

export function typeGuarantees(
  now: Date,
  active: ActiveTask,
  reviewing1: ReviewingTask<1>,
  reviewing2: ReviewingTask<2>,
  disputed: DisputedTask,
  success: SuccessTask,
  openFirst: Objection<1, "open">,
  openSecond: Objection<2, "open">,
  storage: ObjectStorage,
  friendView: FriendTaskView,
  grant: PhotoAccessGrant,
  path: StoragePath,
  u: UserId,
  s: UploadSessionId,
): void {
  // 正しい遷移はコンパイルできる
  submitInitialEvidence(active, 1, now);
  acceptFirstObjection(reviewing1, now);
  submitAdditionalEvidence(disputed, now);
  withdrawFirstObjection(disputed, openFirst, now);
  startAdditionalUpload(s, disputed, u, now);

  // 遷移元の状態が違えばコンパイルできない
  // @ts-expect-error 達成済みのタスクに初回証拠は提出できない
  submitInitialEvidence(success, 1, now);
  // @ts-expect-error 審査中のタスクに追加証拠は提出できない（追加証拠待ち disputed のみ）
  submitAdditionalEvidence(reviewing1, now);
  // @ts-expect-error 再審査（round 2）の異議受理は専用の関数を使う
  acceptFirstObjection(reviewing2, now);
  // @ts-expect-error 再審査の異議は取り下げられない
  withdrawFirstObjection(disputed, openSecond, now);
  // @ts-expect-error 初回証拠が未提出の（active）タスクに追加証拠のアップロードは開始できない
  startAdditionalUpload(s, active, u, now);

  // 金額が非公開のフレンド向け View は penaltyAmount を持てない
  if (!friendView.isPenaltyPublic) {
    // @ts-expect-error 非公開の金額は型の上で存在しない
    const leaked: number = friendView.penaltyAmount;
    use(leaked);
  }
  // @ts-expect-error 閲覧権限のない役割（none）では View を作れない
  toTaskView(success, "none");

  // 署名 URL は権限の証明なしには発行できない
  void storage.createSignedReadUrl(grant, path, 60);
  // @ts-expect-error PhotoAccessGrant が必要
  void storage.createSignedReadUrl(path, 60);
  // @ts-expect-error 検証済みのストレージパス（StoragePath）が必要。生の文字列は渡せない
  void storage.createSignedReadUrl(grant, "evidence/x/1.jpg", 60);

  // 写真は 1〜3 枚のタプル
  const ok: PhotoPaths = [path, path];
  // @ts-expect-error 0 枚は表現できない
  const none: PhotoPaths = [];
  // @ts-expect-error 4 枚は表現できない
  const four: PhotoPaths = [path, path, path, path];
  use(ok, none, four);

  // 検証していない値は、検証済みの型に入れられない
  // @ts-expect-error parseTaskDeadline を通した期限（TaskDeadline）が必要
  const deadline: TaskDeadline = now;
  // @ts-expect-error 冪等性の対象として登録していない操作名は使えない
  const operation: IdempotentOperation = "typo";
  // @ts-expect-error 保存するのは成功のレスポンスだけ。登録していないステータスは使えない
  const status: IdempotentResponseStatus = 500;
  use(deadline, operation, status);

  // ID を取り違えるとコンパイルできない
  const taskId = "t" as TaskId;
  // @ts-expect-error TaskId は ObjectionId ではない
  const wrong: ObjectionId = taskId;
  use(wrong);
}
