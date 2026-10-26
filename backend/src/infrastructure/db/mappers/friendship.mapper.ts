import type { Friendship } from "../../../domain/friendship/friendship.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { NewRow, FriendshipsTable, Row } from "../schema.ts";
import { CorruptRowError, nonNull } from "./common.ts";
import { friendshipId, userId } from "./ids.ts";

export type FriendshipRow = Row<FriendshipsTable>;

/** 2人の ID を辞書順に並べた組。順序に依存しないペア一意制約のために使う */
export function canonicalPair(a: UserId, b: UserId): { low: UserId; high: UserId } {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}

export function rowToFriendship(row: FriendshipRow): Friendship {
  const base = {
    id: friendshipId(row.id),
    requesterId: userId(row.requester_id),
    receiverId: userId(row.receiver_id),
    requestedAt: row.requested_at,
  };
  switch (row.status) {
    case "pending":
    case "rejected":
    case "cancelled":
    case "removed":
      return { ...base, status: row.status };
    case "accepted":
      return { ...base, status: "accepted", acceptedAt: nonNull(row.accepted_at, "friendships", "accepted_at") };
    case "blocked":
      return { ...base, status: "blocked", blockedBy: userId(nonNull(row.blocked_by, "friendships", "blocked_by")) };
    default:
      throw new CorruptRowError("friendships", `status が不正: ${row.status}`);
  }
}

export function friendshipToRow(f: Friendship): NewRow<FriendshipsTable> {
  const { low, high } = canonicalPair(f.requesterId, f.receiverId);
  return {
    id: f.id,
    user_low_id: low,
    user_high_id: high,
    requester_id: f.requesterId,
    receiver_id: f.receiverId,
    status: f.status,
    blocked_by: f.status === "blocked" ? f.blockedBy : null,
    requested_at: f.requestedAt,
    accepted_at: f.status === "accepted" ? f.acceptedAt : null,
  };
}
