import { DomainError } from "../shared/errors.ts";
import { assertNever } from "../shared/exhaustive.ts";
import type { FriendshipId, UserId } from "../shared/ids.ts";

/** 2人の関係につき1行（順序非依存で一意）。再申請は同じ行を再利用する */
type FriendshipBase = Readonly<{
  id: FriendshipId;
  requesterId: UserId;
  receiverId: UserId;
  requestedAt: Date;
}>;

export type PendingFriendship = FriendshipBase & Readonly<{ status: "pending" }>;
export type AcceptedFriendship = FriendshipBase & Readonly<{ status: "accepted"; acceptedAt: Date }>;
export type RejectedFriendship = FriendshipBase & Readonly<{ status: "rejected" }>;
export type CancelledFriendship = FriendshipBase & Readonly<{ status: "cancelled" }>;
export type RemovedFriendship = FriendshipBase & Readonly<{ status: "removed" }>;
export type BlockedFriendship = FriendshipBase & Readonly<{ status: "blocked"; blockedBy: UserId }>;

export type Friendship =
  | PendingFriendship
  | AcceptedFriendship
  | RejectedFriendship
  | CancelledFriendship
  | RemovedFriendship
  | BlockedFriendship;
export type FriendshipStatus = Friendship["status"];

const involves = (f: FriendshipBase, u: UserId): boolean => f.requesterId === u || f.receiverId === u;

function requireParty(f: FriendshipBase, u: UserId): void {
  if (!involves(f, u)) throw new DomainError("FORBIDDEN", "当事者ではありません");
}

/**
 * 申請。existing は (from,to) のペアの既存行（なければ null）。
 * 既存の状態を switch で網羅しているため、状態が増えるとコンパイルエラーになる。
 */
export function requestFriendship(
  newId: FriendshipId,
  from: UserId,
  to: UserId,
  existing: Friendship | null,
  now: Date,
): PendingFriendship {
  if (from === to) throw new DomainError("VALIDATION_ERROR", "自分自身には申請できません");
  const fresh = (id: FriendshipId): PendingFriendship => ({
    id,
    requesterId: from,
    receiverId: to,
    requestedAt: now,
    status: "pending",
  });
  if (existing === null) return fresh(newId);
  switch (existing.status) {
    case "blocked":
      throw new DomainError("FORBIDDEN", "この相手には申請できません");
    case "accepted":
      throw new DomainError("ALREADY_EXISTS", "すでにフレンドです");
    case "pending":
      throw new DomainError(
        "ALREADY_EXISTS",
        "すでに申請中です（相手からの申請が届いている場合は承認してください）",
      );
    case "rejected":
    case "cancelled":
    case "removed":
      return fresh(existing.id); // 再申請は同じ行を再利用
    default:
      return assertNever(existing);
  }
}

export function acceptFriendship(f: PendingFriendship, by: UserId, now: Date): AcceptedFriendship {
  if (by !== f.receiverId) throw new DomainError("FORBIDDEN", "受信者のみ承認できます");
  return { ...f, status: "accepted", acceptedAt: now };
}

export function rejectFriendship(f: PendingFriendship, by: UserId): RejectedFriendship {
  if (by !== f.receiverId) throw new DomainError("FORBIDDEN", "受信者のみ拒否できます");
  return { ...f, status: "rejected" };
}

export function cancelFriendship(f: PendingFriendship, by: UserId): CancelledFriendship {
  if (by !== f.requesterId) throw new DomainError("FORBIDDEN", "申請者のみ取り消せます");
  return { ...f, status: "cancelled" };
}

export function removeFriendship(f: AcceptedFriendship, by: UserId): RemovedFriendship {
  requireParty(f, by);
  return {
    id: f.id,
    requesterId: f.requesterId,
    receiverId: f.receiverId,
    requestedAt: f.requestedAt,
    status: "removed",
  };
}

/** どの状態からでもブロックできる。相手がブロック済みなら不可 */
export function blockFriendship(f: Friendship, by: UserId): BlockedFriendship {
  requireParty(f, by);
  if (f.status === "blocked" && f.blockedBy !== by) {
    throw new DomainError("STATE_CONFLICT", "相手によるブロックが存在します");
  }
  return {
    id: f.id,
    requesterId: f.requesterId,
    receiverId: f.receiverId,
    requestedAt: f.requestedAt,
    status: "blocked",
    blockedBy: by,
  };
}

/** 関係行がない相手を新規にブロックする */
export function blockStranger(newId: FriendshipId, by: UserId, target: UserId, now: Date): BlockedFriendship {
  if (by === target) throw new DomainError("VALIDATION_ERROR", "自分自身はブロックできません");
  return {
    id: newId,
    requesterId: by,
    receiverId: target,
    requestedAt: now,
    status: "blocked",
    blockedBy: by,
  };
}

/** ブロックした本人のみ解除できる。解除後は removed（再申請は可能） */
export function unblockFriendship(f: BlockedFriendship, by: UserId): RemovedFriendship {
  if (f.blockedBy !== by) throw new DomainError("FORBIDDEN", "ブロックした本人のみ解除できます");
  return {
    id: f.id,
    requesterId: f.requesterId,
    receiverId: f.receiverId,
    requestedAt: f.requestedAt,
    status: "removed",
  };
}

/** DB から読んだ値を特定の状態に絞る */
export function expectFriendshipStatus<S extends FriendshipStatus>(
  f: Friendship,
  status: S,
): Extract<Friendship, { status: S }> {
  if (f.status !== status) throw new DomainError("STATE_CONFLICT", "現在の関係ではこの操作はできません");
  return f as Extract<Friendship, { status: S }>;
}

export const friendOf = (f: FriendshipBase, me: UserId): UserId =>
  f.requesterId === me ? f.receiverId : f.requesterId;
