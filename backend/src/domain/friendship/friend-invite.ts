import type { UserId } from "../shared/ids.ts";

/** 招待リンク。恒久的に再利用可能。token は URL に埋め込むため平文で保持する（申請しかできない低権限トークン） */
export interface FriendInvite {
  readonly id: string;
  readonly inviterId: UserId;
  readonly token: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
}
