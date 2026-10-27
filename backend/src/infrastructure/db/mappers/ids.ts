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

import { brandAs } from "../../../domain/shared/brand.ts";

/** DB から読んだ文字列を名目型の ID にする。infrastructure の境界でのみ使う */
export const userId = (s: string): UserId => brandAs<"UserId">()(s);
export const taskId = (s: string): TaskId => brandAs<"TaskId">()(s);
export const evidenceId = (s: string): EvidenceId => brandAs<"EvidenceId">()(s);
export const uploadSessionId = (s: string): UploadSessionId => brandAs<"UploadSessionId">()(s);
export const objectionId = (s: string): ObjectionId => brandAs<"ObjectionId">()(s);
export const friendshipId = (s: string): FriendshipId => brandAs<"FriendshipId">()(s);
export const postId = (s: string): PostId => brandAs<"PostId">()(s);
export const notificationId = (s: string): NotificationId => brandAs<"NotificationId">()(s);
