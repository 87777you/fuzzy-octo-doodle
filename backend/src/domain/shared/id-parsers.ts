import { brandAs } from "./brand.ts";
import { DomainError } from "./errors.ts";
import type {
  EvidenceId,
  FriendshipId,
  NotificationId,
  ObjectionId,
  PostId,
  TaskId,
  UploadSessionId,
  UserId,
} from "./ids.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuid(raw: string, label: string): string {
  if (!UUID_PATTERN.test(raw)) throw new DomainError("VALIDATION_ERROR", `${label} の形式が不正です`);
  return raw.toLowerCase();
}

/** URL やリクエスト本文の文字列を、ID の名目型にする。形式の確認だけで、存在の確認は repository の責務 */
export const parseUserId = (raw: string): UserId => brandAs<"UserId">()(uuid(raw, "userId"));
export const parseTaskId = (raw: string): TaskId => brandAs<"TaskId">()(uuid(raw, "taskId"));
export const parseEvidenceId = (raw: string): EvidenceId => brandAs<"EvidenceId">()(uuid(raw, "evidenceId"));
export const parseUploadSessionId = (raw: string): UploadSessionId =>
  brandAs<"UploadSessionId">()(uuid(raw, "sessionId"));
export const parseObjectionId = (raw: string): ObjectionId => brandAs<"ObjectionId">()(uuid(raw, "objectionId"));
export const parseFriendshipId = (raw: string): FriendshipId => brandAs<"FriendshipId">()(uuid(raw, "friendshipId"));
export const parsePostId = (raw: string): PostId => brandAs<"PostId">()(uuid(raw, "postId"));
export const parseNotificationId = (raw: string): NotificationId =>
  brandAs<"NotificationId">()(uuid(raw, "notificationId"));
