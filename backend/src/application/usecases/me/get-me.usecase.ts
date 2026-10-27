import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { User } from "../../../domain/user/user.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** GetMeUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetMeInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
}

/** 認証利用者本人の User。 */
export type GetMeOutput = User;

/**
 * 責務: 認証利用者本人のプロフィールを返す。プロフィール更新や他利用者の検索は担わない。
 *
 * 全体の流れ:
 *   GET /api/me
 *     → MeController.show（セッション利用者を取得）
 *     → この execute
 *     → UserRepository.findById
 *     → User を返す。
 *
 * 処理:
 *   1. UnitOfWork.run を開始する。
 *   2. UserRepository.findById(tx, userId) を呼び、本人のプロフィールを取得する。
 *   3. 結果が null なら DomainError("NOT_FOUND") を投げ、存在する場合は User を返す。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 認証利用者に対応する User が保存されていない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class GetMeUseCase {
  /** 利用者情報の取得をトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 利用者 ID からプロフィールを取得する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.users = users;
  }

  /**
   * 認証利用者本人のプロフィールを返す。プロフィール更新や他利用者の検索は担わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: GetMeInput): Promise<GetMeOutput> {
    return todo("GetMeUseCase");
  }
}
