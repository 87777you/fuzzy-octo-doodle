import type { Brand } from "../shared/brand.ts";
import type { TaskId, UserId } from "../shared/ids.ts";
import type { Task } from "./task.ts";
import { brandAs } from "../shared/brand.ts";

export type ViewerRole = "owner" | "friend" | "none";

export function viewerRole(ownerId: UserId, viewerId: UserId, isFriend: boolean): ViewerRole {
  if (ownerId === viewerId) return "owner";
  return isFriend ? "friend" : "none";
}

/**
 * 証拠写真の閲覧許可の証明。この型の値は authorizePhotoAccess だけが作る。
 * ObjectStorage.createSignedReadUrl はこれを要求するため、権限判定を通さずに署名 URL を発行するコードはコンパイルできない。
 * 閲覧可: 本人は常に、フレンドは審査中（reviewing）と追加証拠待ち（disputed）のみ。
 */
export type PhotoAccessGrant = Brand<{ readonly taskId: TaskId }, "PhotoAccessGrant">;

export function authorizePhotoAccess(task: Task, role: ViewerRole): PhotoAccessGrant | null {
  const allowed =
    role === "owner" || (role === "friend" && (task.status === "reviewing" || task.status === "disputed"));
  return allowed ? brandAs<"PhotoAccessGrant">()({ taskId: task.id }) : null;
}

/** 異議の申し立て権限の証明（フレンドであり、審査中のタスクであること） */
export type ObjectionRight = Brand<
  { readonly taskId: TaskId; readonly objectorId: UserId },
  "ObjectionRight"
>;

export function authorizeObjection(
  task: Task,
  role: ViewerRole,
  viewerId: UserId,
): { task: Extract<Task, { status: "reviewing" }>; right: ObjectionRight } | null {
  if (role !== "friend" || task.status !== "reviewing") return null;
  return { task, right: brandAs<"ObjectionRight">()({ taskId: task.id, objectorId: viewerId }) };
}

/** 異議理由: 本人と申立人のみ */
export const canSeeObjectionReason = (viewerId: UserId, ownerId: UserId, objectorId: UserId): boolean =>
  viewerId === ownerId || viewerId === objectorId;
