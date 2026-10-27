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

/**
 * 責務: URL やリクエスト本文の文字列を、ID の名目型（UserId、TaskId など）に変換する parse 関数の置き場。
 * 確認するのは UUID の形式だけ。その ID の行が存在するか、操作してよいかは確認しない（repository とユースケースの責務）。
 *
 * 全体の流れ: コントローラが `@Param` などの文字列をここで名目型にする → ユースケースの Input に入れる。
 * 形式が不正なら DomainError("VALIDATION_ERROR")（400）になり、DB に不正な値が届かない。
 * `brandAs` を使うのは、検証を済ませたこのファイルの中に限る（docs/backend-architecture.md の規約 14）。
 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** UUID の形式を確認し、小文字にそろえて返す。label はエラーメッセージに入る入力の名前 */
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
