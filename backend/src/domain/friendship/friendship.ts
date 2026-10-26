import { DomainError } from "../shared/errors.ts";
import type { FriendshipId, UserId } from "../shared/ids.ts";

export type FriendshipStatus = "pending" | "accepted" | "rejected" | "cancelled" | "removed" | "blocked";

export interface FriendshipProps {
  id: FriendshipId;
  requesterId: UserId;
  receiverId: UserId;
  status: FriendshipStatus;
  blockedBy: UserId | null;
  requestedAt: Date;
  acceptedAt: Date | null;
}

/** 2人の関係につき1行（順序非依存で一意）。再申請は同じ行を再利用する */
export class Friendship {
  private props: FriendshipProps;
  private constructor(props: FriendshipProps) {
    this.props = props;
  }

  static reconstitute(props: FriendshipProps): Friendship {
    return new Friendship({ ...props });
  }

  /**
   * 申請。existing は (from,to) のペアの既存行（なければ null）。
   * 新規作成 or 既存行の再活性化を行い、保存すべき Friendship を返す。
   */
  static request(
    newId: FriendshipId,
    from: UserId,
    to: UserId,
    existing: Friendship | null,
    now: Date,
  ): Friendship {
    if (from === to) throw new DomainError("VALIDATION_ERROR", "自分自身には申請できません");
    if (!existing) {
      return new Friendship({
        id: newId,
        requesterId: from,
        receiverId: to,
        status: "pending",
        blockedBy: null,
        requestedAt: now,
        acceptedAt: null,
      });
    }
    const s = existing.props.status;
    if (s === "blocked") throw new DomainError("FORBIDDEN", "この相手には申請できません");
    if (s === "accepted") throw new DomainError("ALREADY_EXISTS", "すでにフレンドです");
    if (s === "pending")
      throw new DomainError(
        "ALREADY_EXISTS",
        "すでに申請中です（相手からの申請が届いている場合は承認してください）",
      );
    // rejected / cancelled / removed → 再申請
    existing.props = {
      ...existing.props,
      requesterId: from,
      receiverId: to,
      status: "pending",
      blockedBy: null,
      requestedAt: now,
      acceptedAt: null,
    };
    return existing;
  }

  accept(by: UserId, now: Date): void {
    this.requirePending();
    if (by !== this.props.receiverId) throw new DomainError("FORBIDDEN", "受信者のみ承認できます");
    this.props.status = "accepted";
    this.props.acceptedAt = now;
  }
  reject(by: UserId): void {
    this.requirePending();
    if (by !== this.props.receiverId) throw new DomainError("FORBIDDEN", "受信者のみ拒否できます");
    this.props.status = "rejected";
  }
  cancel(by: UserId): void {
    this.requirePending();
    if (by !== this.props.requesterId) throw new DomainError("FORBIDDEN", "申請者のみ取り消せます");
    this.props.status = "cancelled";
  }
  remove(by: UserId): void {
    this.requireParty(by);
    if (this.props.status !== "accepted") throw new DomainError("STATE_CONFLICT", "フレンドではありません");
    this.props.status = "removed";
  }
  /** どの状態からでもブロック可。ブロック済みなら冪等 */
  block(by: UserId): void {
    this.requireParty(by);
    if (this.props.status === "blocked") {
      if (this.props.blockedBy !== by)
        throw new DomainError("STATE_CONFLICT", "相手によるブロックが存在します");
      return;
    }
    this.props.status = "blocked";
    this.props.blockedBy = by;
  }
  /** ブロックした本人のみ解除可。解除後は removed（再申請は可能） */
  unblock(by: UserId): void {
    if (this.props.status !== "blocked" || this.props.blockedBy !== by) {
      throw new DomainError("STATE_CONFLICT", "ブロックを解除できません");
    }
    this.props.status = "removed";
    this.props.blockedBy = null;
  }

  /** 新規ブロック用: 関係行が存在しない相手をブロックする */
  static blockStranger(newId: FriendshipId, by: UserId, target: UserId, now: Date): Friendship {
    if (by === target) throw new DomainError("VALIDATION_ERROR", "自分自身はブロックできません");
    return new Friendship({
      id: newId,
      requesterId: by,
      receiverId: target,
      status: "blocked",
      blockedBy: by,
      requestedAt: now,
      acceptedAt: null,
    });
  }

  get id(): FriendshipId {
    return this.props.id;
  }
  get status(): FriendshipStatus {
    return this.props.status;
  }
  involves(u: UserId): boolean {
    return this.props.requesterId === u || this.props.receiverId === u;
  }
  otherParty(u: UserId): UserId {
    return this.props.requesterId === u ? this.props.receiverId : this.props.requesterId;
  }
  snapshot(): Readonly<FriendshipProps> {
    return { ...this.props };
  }

  private requirePending(): void {
    if (this.props.status !== "pending") throw new DomainError("STATE_CONFLICT", "申請中ではありません");
  }
  private requireParty(u: UserId): void {
    if (!this.involves(u)) throw new DomainError("FORBIDDEN", "当事者ではありません");
  }
}
