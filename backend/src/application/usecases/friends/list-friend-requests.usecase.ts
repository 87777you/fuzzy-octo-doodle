import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { FriendRequestView } from "../../../domain/friendship/friend-views.ts";
import type { ListFriendRequestsInput } from "../../ports/usecases/list-friend-requests.port.ts";

/**
 * 責務: ログイン利用者が受信した pending 申請、または自分が送信した pending 申請を指定方向で返す。承認・拒否・取消は行わない。
 *
 * 全体の流れ:
 *   GET /api/friend-requests?direction=...
 *     → 全体のセッションガード → FriendsController.listRequests（query を検証）
 *     → この execute → listIncomingPending または listOutgoingPending → UserRepository.findByIds → FriendRequestView[]。
 *
 * 処理:
 *   1. UnitOfWork.run 内で direction を分岐し、"incoming" なら FriendshipRepository.listIncomingPending、"outgoing" なら listOutgoingPending を userId で呼ぶ。
 *   2. 返された関係から requesterId と receiverId を集め、UserRepository.findByIds で表示名を取得する。
 *   3. 各関係を id、requester の UserSummary、addressee の UserSummary、requestedAt を持つ FriendRequestView に写して返す。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ListFriendRequestsUseCase {
  /** 申請一覧と表示用プロフィールを同一の読み取りトランザクション内で取得する。 */
  protected readonly uow: UnitOfWork;
  /** direction に応じて受信または送信の pending 関係を取得する。 */
  protected readonly friendships: FriendshipRepository;
  /** 申請の両当事者のプロフィールを取得して FriendRequestView に含める。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.friendships = friendships;
    this.users = users;
  }

  /**
   * ログイン利用者が受信した pending 申請、または自分が送信した pending 申請を指定方向で返す。承認・拒否・取消は行わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ListFriendRequestsInput): Promise<readonly FriendRequestView[]> {
    return todo("ListFriendRequestsUseCase");
  }
}
