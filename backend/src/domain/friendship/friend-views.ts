import type { FriendshipId, UserId } from "../shared/ids.ts";

/**
 * 責務: フレンド関連の画面に出す「相手の情報」と「申請の表示形」を、domain の値として定める。
 * 複数のユースケース（一覧、申請、承認など）が同じ形を返すので、特定のユースケースではなくここに置く。
 */

/** 友だち関連の画面に出す相手の情報 */
export interface UserSummary {
  userId: UserId;
  nickname: string;
}

/** フレンド申請（受信・送信どちらの一覧にも使う） */
export interface FriendRequestView {
  id: FriendshipId;
  requester: UserSummary;
  addressee: UserSummary;
  requestedAt: Date;
}
