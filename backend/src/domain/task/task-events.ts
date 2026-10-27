import type { TaskId, UserId } from "../shared/ids.ts";

/** 終了したタスクの結果。closed（退会などによる終了）は遷移では発生しないため含めない */
export type TaskFinalResult = "success" | "failed" | "indeterminate";

type TaskEventBase = Readonly<{ taskId: TaskId; ownerId: UserId }>;

export type TaskCreatedEvent = TaskEventBase & Readonly<{ type: "TaskCreated" }>;

/** reviewStarted: フレンドがいて審査が始まったか。false なら即時に達成となった */
export type InitialEvidenceSubmittedEvent = TaskEventBase &
  Readonly<{ type: "InitialEvidenceSubmitted"; reviewStarted: boolean }>;

export type AdditionalEvidenceSubmittedEvent = TaskEventBase & Readonly<{ type: "AdditionalEvidenceSubmitted" }>;

/** round: 異議が成立した審査の回（1=初回、2=再審査） */
export type ObjectionAcceptedEvent = TaskEventBase & Readonly<{ type: "ObjectionAccepted"; round: 1 | 2 }>;

export type ObjectionWithdrawnEvent = TaskEventBase & Readonly<{ type: "ObjectionWithdrawn" }>;

export type TaskFinalizedEvent = TaskEventBase & Readonly<{ type: "TaskFinalized"; result: TaskFinalResult }>;

/** 集約が発行するドメインイベント。投稿・通知・請求への変換は application 層の責務 */
export type TaskEvent =
  | TaskCreatedEvent
  | InitialEvidenceSubmittedEvent
  | AdditionalEvidenceSubmittedEvent
  | ObjectionAcceptedEvent
  | ObjectionWithdrawnEvent
  | TaskFinalizedEvent;
