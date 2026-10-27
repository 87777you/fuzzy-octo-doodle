import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { User } from "../../../domain/user/user.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** UpdateMeUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface UpdateMeInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** PATCH body の nickname。Controller が文字列形式を検証し、parseNickname が長さと空文字を検証する。 */
  nickname: string;
}

/** ニックネームと updatedAt を更新した User。 */
export type UpdateMeOutput = User;

/**
 * 責務: 認証利用者本人のニックネームを検証して更新する。認証情報や他利用者のプロフィールは変更しない。
 *
 * 全体の流れ:
 *   PATCH /api/me
 *     → MeController.update（セッション利用者と body を検証）
 *     → この execute
 *     → UserRepository.findById → changeNickname → UserRepository.save
 *     → 更新後の User を返す。
 *
 * 処理:
 *   1. UnitOfWork.run の中で UserRepository.findById(tx, userId) を呼び、本人の User を取得する。
 *   2. User がなければ DomainError("NOT_FOUND") を投げる。
 *   3. Clock.now() を取得し、changeNickname(user, nickname, now) を呼ぶ。parseNickname が前後の空白を除き、1〜20文字を検証する。
 *   4. UserRepository.save(tx, updatedUser) を呼び、更新後の User を返す。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 認証利用者に対応する User が保存されていない。
 *   - DomainError("VALIDATION_ERROR"): ニックネームが空、または前後の空白を除いて20文字を超える。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class UpdateMeUseCase {
  /** プロフィールの取得と保存を同じトランザクションにまとめる。 */
  protected readonly uow: UnitOfWork;
  /** プロフィールの updatedAt に使う現在時刻を取得する。 */
  protected readonly clock: Clock;
  /** 本人のプロフィールを取得し、更新後の User を保存する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.users = users;
  }

  /**
   * 認証利用者本人のニックネームを検証して更新する。認証情報や他利用者のプロフィールは変更しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: UpdateMeInput): Promise<UpdateMeOutput> {
    return todo("UpdateMeUseCase");
  }
}
