import type { UserId } from "../shared/ids.ts";
import type { TaskStatus } from "./task-status.ts";

export type ViewerRole = "owner" | "friend" | "none";

export function viewerRole(ownerId: UserId, viewerId: UserId, isFriend: boolean): ViewerRole {
  if (ownerId === viewerId) return "owner";
  return isFriend ? "friend" : "none";
}

export const canViewTask = (role: ViewerRole): boolean => role !== "none";

/** 金額: 本人は常に可、フレンドは公開設定ONのときのみ。非公開時はレスポンスにキー自体を含めないこと */
export const canSeePenaltyAmount = (role: ViewerRole, isPenaltyPublic: boolean): boolean =>
  role === "owner" || (role === "friend" && isPenaltyPublic);

/** 証拠写真: フレンドは審査中（reviewing）と追加証拠待ち（disputed）のみ。確定後は本人のみ */
export const canSeeEvidencePhotos = (role: ViewerRole, status: TaskStatus): boolean =>
  role === "owner" || (role === "friend" && (status === "reviewing" || status === "disputed"));

/** 異議の申し立て可否の役割条件（期限・先着は Task / ObjectionRepository 側） */
export const canObject = (role: ViewerRole, status: TaskStatus): boolean =>
  role === "friend" && status === "reviewing";

/** 異議理由: 本人と申立人のみ */
export const canSeeObjectionReason = (viewerId: UserId, ownerId: UserId, objectorId: UserId): boolean =>
  viewerId === ownerId || viewerId === objectorId;
