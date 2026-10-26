import { DomainError } from "../shared/errors.ts";
import { HOUR_MS, MINUTE_MS } from "../shared/time.ts";

export const TASK_MIN_LEAD_MS = 10 * MINUTE_MS;
export const TASK_MAX_LEAD_MS = 72 * HOUR_MS;
export const UPLOAD_GRACE_MS = 5 * MINUTE_MS;
export const REVIEW_PERIOD_MS = 24 * HOUR_MS;
export const ADDITIONAL_EVIDENCE_PERIOD_MS = 24 * HOUR_MS;

export const PENALTY_MIN = 100;
export const PENALTY_MAX = 10_000;
export const TITLE_MAX = 100;
export const MAX_PENDING_INITIAL_TASKS = 3;

export function assertDeadlineInRange(deadline: Date, now: Date): void {
  const lead = deadline.getTime() - now.getTime();
  if (lead < TASK_MIN_LEAD_MS || lead > TASK_MAX_LEAD_MS) {
    throw new DomainError("VALIDATION_ERROR", "期限は作成時点から10分〜72時間の範囲で指定してください");
  }
}

/** 初回証拠未提出（active）が3件以上なら作成不可。呼び出し側がロック下で件数を渡す */
export function assertCanCreateTask(activeInitialCount: number): void {
  if (activeInitialCount >= MAX_PENDING_INITIAL_TASKS) {
    throw new DomainError("TOO_MANY_ACTIVE_TASKS", "初回証拠が未提出のタスクは同時に3件までです");
  }
}

/** アップロード「開始」が許されるか。期限ちょうどは有効 */
export const canStartUploadBy = (deadline: Date, now: Date): boolean => now.getTime() <= deadline.getTime();

/** 開始済みアップロードの完了期限（本来の期限 + 5分） */
export const uploadCompleteBy = (deadline: Date): Date => new Date(deadline.getTime() + UPLOAD_GRACE_MS);
