export const TASK_STATUSES = [
  "active",
  "reviewing",
  "disputed",
  "success",
  "failed",
  "indeterminate",
  "closed",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** 0=初回未提出 / 1=初回審査（初回異議） / 2=追加証拠後の再審査 */
export type ReviewRound = 0 | 1 | 2;

export const FINAL_STATUSES: readonly TaskStatus[] = ["success", "failed", "indeterminate", "closed"];
export const isFinal = (s: TaskStatus): boolean => FINAL_STATUSES.includes(s);
