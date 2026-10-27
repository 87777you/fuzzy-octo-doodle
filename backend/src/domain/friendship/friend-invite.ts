import type { UserId } from "../shared/ids.ts";

/** 招待リンク。恒久的に再利用可能。token は URL に埋め込むため平文で保持する（申請しかできない低権限トークン） */
export interface FriendInvite {
  readonly id: string;
  readonly inviterId: UserId;
  readonly token: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
}

/** 招待リンクの作成・再取得 API が返す、URL 組み立て用の情報である。 */
export interface FriendInviteView {
  /** 招待 URL に埋め込む再利用可能な平文 token である。 */
  token: string;
  /** 招待を最初に作成した時刻。既存招待を再利用した場合はその作成時刻である。 */
  createdAt: Date;
}
