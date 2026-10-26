import type { ActiveTask, DisputedTask, ReviewingTask, Task } from "../../domain/task/task.ts";
import type { TaskStatus } from "../../domain/task/task-status.ts";
import type { TaskId, UserId } from "../../domain/shared/ids.ts";
import type { Tx } from "./unit-of-work.port.ts";

export interface ListMyTasksQuery {
  owner: UserId;
  view: "active" | "history"; // active: active/reviewing/disputed  history: success/failed/indeterminate/closed
  status?: TaskStatus;
  search?: string; // タイトル部分一致
  cursor?: string;
  limit: number;
}
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface TaskRepository {
  insert(tx: Tx, task: ActiveTask): Promise<void>;
  findById(tx: Tx, id: TaskId): Promise<Task | null>;
  /** SELECT ... FOR UPDATE。状態を変更する全ユースケースは必ずこれで取得する */
  findByIdForUpdate(tx: Tx, id: TaskId): Promise<Task | null>;
  save(tx: Tx, task: Task): Promise<void>;

  /** 初回未提出(active)の件数 */
  countActiveInitial(tx: Tx, owner: UserId): Promise<number>;
  /** 同一ユーザーの作成を直列化するロック（PG: pg_advisory_xact_lock / MariaDB: GET_LOCK 等） */
  lockUserForCreation(tx: Tx, owner: UserId): Promise<void>;

  listByOwner(tx: Tx, q: ListMyTasksQuery): Promise<Page<Task>>;

  /** ジョブ用: 条件に合致する行を FOR UPDATE SKIP LOCKED で最大 limit 件ロック取得 */
  lockExpiredInitial(tx: Tx, now: Date, limit: number): Promise<ActiveTask[]>; // status=active AND deadline_at < now
  lockReviewEnded(tx: Tx, now: Date, limit: number): Promise<ReviewingTask[]>; // status=reviewing AND review_deadline_at <= now
  lockExpiredAdditional(tx: Tx, now: Date, limit: number): Promise<DisputedTask[]>; // status=disputed AND additional_deadline_at < now
}
export const TASK_REPOSITORY = Symbol("TaskRepository");
