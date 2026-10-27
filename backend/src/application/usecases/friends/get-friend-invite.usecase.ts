import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { FRIEND_INVITE_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendInviteRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserSummary } from "../views.ts";

/** GetFriendInviteUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetFriendInviteInput {
  /** URL の :token から得る招待 token。パス値として受け取り、該当する有効招待の有無を repository で確認する。 */
  token: string;
}

/** 招待リンクの公開画面に表示する招待者の userId と nickname。 */
export type GetFriendInviteOutput = UserSummary;

/**
 * 責務: 公開招待リンクから招待者のニックネームだけを返す。認証やフレンド申請の作成は担当しない。
 *
 * 全体の流れ:
 *   GET /api/friend-invites/:token（@Public）
 *     → 全体のガードは認証を要求せず、Origin・セッションガードの規則に従う → FriendsController.getInvite
 *     → この execute → FriendInviteRepository.findActiveByToken → UserRepository.findById → UserSummary。
 *
 * 処理:
 *   1. UnitOfWork.run 内で FriendInviteRepository.findActiveByToken を呼ぶ。該当する有効招待がなければ NOT_FOUND とする。
 *   2. 招待の inviterId を UserRepository.findById に渡し、招待者を取得する。ユーザーが存在しなければ NOT_FOUND とする。
 *   3. User の ID とニックネームだけを UserSummary にして返す。ここでは申請や承認を作らず、リンク閲覧の権限をプロフィール参照に限定する。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 有効な招待 token または招待者が見つからない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class GetFriendInviteUseCase {
  /** 公開プロフィールを読む招待参照をトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** token に一致する有効な招待を取得する。 */
  protected readonly invites: FriendInviteRepository;
  /** 招待者の User を取得して UserSummary に変換する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(FRIEND_INVITE_REPOSITORY) invites: FriendInviteRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.invites = invites;
    this.users = users;
  }

  /**
   * 公開招待リンクから招待者のニックネームだけを返す。認証やフレンド申請の作成は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: GetFriendInviteInput): Promise<GetFriendInviteOutput> {
    return todo("GetFriendInviteUseCase");
  }
}
