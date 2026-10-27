import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { FriendRequestView } from "../../../domain/friendship/friend-views.ts";
import type { AcceptFriendRequestInput } from "../../ports/usecases/accept-friend-request.port.ts";

/**
 * 責務: 受信者本人の保留中フレンド申請を承認して accepted 状態にする。申請の作成や HTTP 入力検証は担当しない。
 *
 * 全体の流れ:
 *   POST /api/friend-requests/:id/accept
 *     → 全体の Origin・セッションガード → FriendsController.accept（path ID を検証）
 *     → この execute → FriendshipRepository.findById → domain の expectFriendshipStatus / acceptFriendship → FriendshipRepository.save。
 *
 * 処理:
 *   1. UnitOfWork.run 内で FriendshipRepository.findById を呼び、friendshipId の関係を取得する。見つからなければ NOT_FOUND とする。
 *   2. expectFriendshipStatus(f, "pending") で保留中の関係に絞る。別状態なら STATE_CONFLICT とする。
 *   3. clock.now を取得して acceptFriendship(pending, userId, now) を呼ぶ。domain が受信者本人かを検証し、acceptedAt を含む状態を返す。
 *   4. FriendshipRepository.save で承認状態を保存し、FriendRequestView として返す。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 申請 ID が見つからない。
 *   - DomainError("STATE_CONFLICT"): 申請が pending ではない。
 *   - DomainError("FORBIDDEN"): 呼び出し利用者が申請の受信者ではない。
 *
 * 注意:
 *   - FriendRequestView の requester と addressee の nickname は、UserRepository.findByIds で取得して UserSummary にする。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class AcceptFriendRequestUseCase {
  /** 関係の状態変更を保存するトランザクション境界を提供する。 */
  protected readonly uow: UnitOfWork;
  /** 承認日時 acceptedAt に使う現在時刻を提供する。 */
  protected readonly clock: Clock;
  /** 申請を取得し、domain が作った承認状態を保存する。 */
  protected readonly friendships: FriendshipRepository;
  /** 返す FriendRequestView の両者の nickname を取得する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.friendships = friendships;
    this.users = users;
  }

  /**
   * 受信者本人の保留中フレンド申請を承認して accepted 状態にする。申請の作成や HTTP 入力検証は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: AcceptFriendRequestInput): Promise<FriendRequestView> {
    return todo("AcceptFriendRequestUseCase");
  }
}
