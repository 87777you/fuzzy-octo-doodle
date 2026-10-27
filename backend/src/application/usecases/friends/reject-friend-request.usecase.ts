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
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FriendRequestView } from "../views.ts";

/** RejectFriendRequestUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface RejectFriendRequestInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** URL の :id から得る申請 ID。controller で UUID 形式を検証した値である。 */
  friendshipId: string;
}

/** RejectFriendRequestUseCase.execute の戻り値。コントローラがそのまま HTTP のレスポンス本文にする。 */
export type RejectFriendRequestOutput = FriendRequestView;

/**
 * 責務: 受信者本人の保留中フレンド申請を拒否済み状態にする。申請の作成や拒否理由の保存は担当しない。
 *
 * 全体の流れ:
 *   POST /api/friend-requests/:id/reject
 *     → 全体の Origin・セッションガード → FriendsController.reject（path ID を検証）
 *     → この execute → FriendshipRepository.findById → domain の expectFriendshipStatus / rejectFriendship → FriendshipRepository.save。
 *
 * 処理:
 *   1. UnitOfWork.run 内で FriendshipRepository.findById を呼び、friendshipId の関係を取得する。見つからなければ NOT_FOUND とする。
 *   2. expectFriendshipStatus(f, "pending") で保留中の関係に絞る。別状態なら STATE_CONFLICT とする。
 *   3. rejectFriendship(pending, userId) を呼ぶ。domain が受信者本人かを検証し、rejected 状態を返す。
 *   4. FriendshipRepository.save で拒否状態を保存し、FriendRequestView として返す。
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
export class RejectFriendRequestUseCase {
  /** 関係の状態変更を保存するトランザクション境界を提供する。 */
  protected readonly uow: UnitOfWork;
  /** Clock port を注入するが、rejectFriendship は日時を受け取らず、現在の domain 遷移では時刻を記録しない。 */
  protected readonly clock: Clock;
  /** 申請を取得し、domain が作った拒否状態を保存する。 */
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
   * 受信者本人の保留中フレンド申請を拒否済み状態にする。申請の作成や拒否理由の保存は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: RejectFriendRequestInput): Promise<RejectFriendRequestOutput> {
    return todo("RejectFriendRequestUseCase");
  }
}
