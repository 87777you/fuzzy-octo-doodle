import type { TaskId, UserId } from "../shared/ids.ts";

/** 集約が発行するドメインイベント。投稿・通知・請求への変換は application 層の責務 */
export type TaskEvent =
  | { type: "TaskCreated"; taskId: TaskId; ownerId: UserId }
  | { type: "InitialEvidenceSubmitted"; taskId: TaskId; ownerId: UserId; reviewStarted: boolean }
  | { type: "AdditionalEvidenceSubmitted"; taskId: TaskId; ownerId: UserId }
  | { type: "ObjectionAccepted"; taskId: TaskId; ownerId: UserId; round: 1 | 2 }
  | { type: "ObjectionWithdrawn"; taskId: TaskId; ownerId: UserId }
  | {
      type: "TaskFinalized";
      taskId: TaskId;
      ownerId: UserId;
      result: "success" | "failed" | "indeterminate";
    };
