import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { FRIENDSHIP_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendshipRepository } from "../../../application/ports/friendship.repository.ts";
import type { UnblockUserInput } from "../../ports/usecases/unblock-user.port.ts";

/**
 * 責務: 呼び出し利用者本人が設定したブロックを解除し、関係を removed 状態にする。相手が設定したブロックは解除しない。
 *
 * 全体の流れ:
 *   DELETE /api/users/:userId/block
 *     → 全体の Origin・セッションガード → FriendsController.unblock（対象 ID を検証）
 *     → この execute → FriendshipRepository.findByPair(forUpdate) → domain の expectFriendshipStatus / unblockFriendship → save → 204。
 *
 * 処理:
 *   1. UnitOfWork.run 内で FriendshipRepository.findByPair(tx, userId, targetUserId, { forUpdate: true }) を呼び、対象ペアをロックする。
 *   2. 関係がない場合は NOT_FOUND とし、expectFriendshipStatus(f, "blocked") で blocked 状態に絞る。違う状態なら STATE_CONFLICT とする。
 *   3. unblockFriendship(blocked, userId) を呼ぶ。ブロックした本人でなければ FORBIDDEN、成功時は removed 状態になる。
 *   4. FriendshipRepository.save で解除後の状態を保存し、null を返す。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 指定した 2 人の関係がない。
 *   - DomainError("STATE_CONFLICT"): 関係が blocked ではない。
 *   - DomainError("FORBIDDEN"): 呼び出し利用者がブロックした本人ではない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class UnblockUserUseCase {
  /** ブロック状態の取得と解除後の保存をトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** Clock port を注入するが、unblockFriendship は日時を受け取らず、解除時刻を記録しない。 */
  protected readonly clock: Clock;
  /** 利用者ペアの関係をロック付きで取得し、domain が作った解除状態を保存する。 */
  protected readonly friendships: FriendshipRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(FRIENDSHIP_REPOSITORY) friendships: FriendshipRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.friendships = friendships;
  }

  /**
   * 呼び出し利用者本人が設定したブロックを解除し、関係を removed 状態にする。相手が設定したブロックは解除しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: UnblockUserInput): Promise<null> {
    return todo("UnblockUserUseCase");
  }
}
