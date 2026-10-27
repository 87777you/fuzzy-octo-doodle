import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { MyStats } from "../views.ts";

/** GetMyStatsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetMyStatsInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
}

/** 本人のタスク集計と達成率。達成率は対象件数が0件なら null である。 */
export type GetMyStatsOutput = MyStats;

/**
 * 責務: 認証利用者本人のタスク実績と達成率を返す。プロフィールやタスク状態は変更しない。
 *
 * 全体の流れ:
 *   GET /api/me/stats
 *     → MeController.statistics（セッション利用者を取得）
 *     → この execute
 *     → UserRepository.getStats → successRate
 *     → MyStats を返す。
 *
 * 処理:
 *   1. UnitOfWork.run を開始する。
 *   2. UserRepository.getStats(tx, userId) を呼び、success、failed、indeterminate の件数を得る。
 *   3. successRate(stats) で達成率を計算し、stats とともに MyStats として返す。判定不能は分母に含めない。
 *
 * 注意:
 *   - 成功・失敗の合計が0件なら successRate は null となる。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class GetMyStatsUseCase {
  /** 実績集計の読み取りをトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 本人のタスクから成功・失敗・判定不能の件数を集計する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.users = users;
  }

  /**
   * 認証利用者本人のタスク実績と達成率を返す。プロフィールやタスク状態は変更しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: GetMyStatsInput): Promise<GetMyStatsOutput> {
    return todo("GetMyStatsUseCase");
  }
}
