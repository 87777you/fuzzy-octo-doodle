import { Inject, Injectable } from "@nestjs/common";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import { DomainError } from "../../../domain/shared/errors.ts";
import type { User } from "../../../domain/user/user.ts";
import type { GetMeInput } from "../../ports/usecases/get-me.port.ts";

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
   *
   * これは、他のユースケースを実装するときの見本である。次の点を真似する。
   * - 入力 (`GetMeInput`) は、コントローラが検証済みの名目型 (`UserId`) にして渡す。ここで文字列の形式を確認し直さない。
   * - データベースの読み書きは、`UnitOfWork.run` の中の `tx` を渡して行う。1 つの `run` が 1 つのトランザクションになる。
   * - 業務上の失敗は `DomainError` で表す。HTTP のステータスへの変換は、フレームワーク側 (例外フィルタ) の責務で、ここでは知らない。
   */
  execute(input: GetMeInput): Promise<User> {
    // 読み取りだけでも `run` の中で行う。`tx` を受け取る形が、データベースに触れる唯一の入口になる。
    return this.uow.run(async (tx) => {
      const user = await this.users.findById(tx, input.userId);
      // 認証は通ったのに利用者の行がない。通常は起きないが、起きたときは null のまま先に進めず、明示的に失敗させる。
      if (user === null) throw new DomainError("NOT_FOUND", "利用者が見つかりません");
      return user;
    });
  }
}
