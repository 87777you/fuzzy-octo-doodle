import type { TaskId, UserId } from "../shared/ids.ts";
import type { Task, TaskStatus } from "./task.ts";
import type { ViewerRole } from "./visibility-policy.ts";

type ViewBase = Readonly<{
  id: TaskId;
  ownerId: UserId;
  title: string;
  achievementCondition: string;
  evidenceMethod: string;
  deadlineAt: Date;
  status: TaskStatus;
  isPenaltyPublic: boolean;
  createdAt: Date;
}>;

/** 本人向け。金額は常に含む */
export type OwnerTaskView = ViewBase & Readonly<{ viewer: "owner"; penaltyAmount: number }>;

/**
 * フレンド向け。金額が非公開のときは penaltyAmount プロパティが型上存在しない（`never` で封じている）。
 * このため、非公開タスクの金額をレスポンスへ載せるコードはコンパイルできない。
 */
export type FriendTaskView = ViewBase &
  Readonly<{ viewer: "friend" }> &
  (
    | Readonly<{ isPenaltyPublic: true; penaltyAmount: number }>
    | Readonly<{ isPenaltyPublic: false; penaltyAmount?: never }>
  );

export type TaskView = OwnerTaskView | FriendTaskView;

function viewBase(t: Task): Omit<ViewBase, "isPenaltyPublic"> {
  return {
    id: t.id,
    ownerId: t.ownerId,
    title: t.title,
    achievementCondition: t.achievementCondition,
    evidenceMethod: t.evidenceMethod,
    deadlineAt: t.deadlineAt,
    status: t.status,
    createdAt: t.createdAt,
  };
}

/** 呼び出しには 'none' を除外済みの役割が必要。閲覧権限のない相手には View を作れない */
export function toTaskView(task: Task, role: Extract<ViewerRole, "owner">): OwnerTaskView;
export function toTaskView(task: Task, role: Extract<ViewerRole, "friend">): FriendTaskView;
export function toTaskView(task: Task, role: Exclude<ViewerRole, "none">): TaskView;
export function toTaskView(task: Task, role: Exclude<ViewerRole, "none">): TaskView {
  if (role === "owner") {
    return {
      ...viewBase(task),
      isPenaltyPublic: task.isPenaltyPublic,
      viewer: "owner",
      penaltyAmount: task.penaltyAmount,
    };
  }
  if (task.isPenaltyPublic) {
    return { ...viewBase(task), viewer: "friend", isPenaltyPublic: true, penaltyAmount: task.penaltyAmount };
  }
  return { ...viewBase(task), viewer: "friend", isPenaltyPublic: false };
}
