import type {
  EvidenceId,
  FriendshipId,
  NotificationId,
  ObjectionId,
  PostId,
  TaskId,
  UploadSessionId,
  UserId,
} from "../../../domain/shared/ids.ts";

/** DB から読んだ文字列を名目型の ID にする。infrastructure の境界でのみ使う */
export const userId = (s: string): UserId => s as UserId;
export const taskId = (s: string): TaskId => s as TaskId;
export const evidenceId = (s: string): EvidenceId => s as EvidenceId;
export const uploadSessionId = (s: string): UploadSessionId => s as UploadSessionId;
export const objectionId = (s: string): ObjectionId => s as ObjectionId;
export const friendshipId = (s: string): FriendshipId => s as FriendshipId;
export const postId = (s: string): PostId => s as PostId;
export const notificationId = (s: string): NotificationId => s as NotificationId;
