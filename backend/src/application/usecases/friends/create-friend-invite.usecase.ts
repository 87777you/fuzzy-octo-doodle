import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { ID_GENERATOR } from "../../../application/ports/id-generator.port.ts";
import type { IdGenerator } from "../../../application/ports/id-generator.port.ts";
import { FRIEND_INVITE_REPOSITORY } from "../../../application/ports/friendship.repository.ts";
import type { FriendInviteRepository } from "../../../application/ports/friendship.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** 招待リンクの作成・再取得 API が返す、URL 組み立て用の情報である。 */
export interface FriendInviteView {
  /** 招待 URL に埋め込む再利用可能な平文 token である。 */
  token: string;
  /** 招待を最初に作成した時刻。既存招待を再利用した場合はその作成時刻である。 */
  createdAt: Date;
}

/** CreateFriendInviteUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface CreateFriendInviteInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
}

/** CreateFriendInviteUseCase.execute の戻り値。コントローラがそのまま HTTP のレスポンス本文にする。 */
export type CreateFriendInviteOutput = FriendInviteView;

/**
 * 責務: ログイン利用者が招待リンクを取得できるようにし、有効な招待がなければ 1 件作成する。招待の承認やフレンド関係の作成は担当しない。
 *
 * 全体の流れ:
 *   POST /api/friend-invites
 *     → 全体の Origin・セッションガード → FriendsController.createInvite
 *     → この execute → FriendInviteRepository.findActiveByInviter → 必要な場合だけ IdGenerator.inviteToken / insert → FriendInviteView。
 *
 * 処理:
 *   1. UnitOfWork.run 内で FriendInviteRepository.findActiveByInviter に userId を渡す。
 *   2. 有効な招待があれば token と createdAt を FriendInviteView にして返し、再生成しない。
 *   3. 見つからない場合は clock.now、IdGenerator.uuid、IdGenerator.inviteToken から FriendInvite を作り、FriendInviteRepository.insert で保存する。
 *   4. 保存後、URL に埋め込む token と createdAt を FriendInviteView として返す。招待はリンクから再取得できる状態で維持する。
 *
 * 注意:
 *   - FriendInvite.token は平文保存であり、リンクを再取得できる仕様である。token をハッシュ保存に置き換えたり、招待リンクを開いただけで承認済みにしたりしない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class CreateFriendInviteUseCase {
  /** 既存招待の検索と新規招待の保存をトランザクション内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 招待の createdAt に使う現在時刻を提供する。 */
  protected readonly clock: Clock;
  /** 招待行の ID と URL に使う推測困難な token を採番する。 */
  protected readonly ids: IdGenerator;
  /** 利用者の有効な招待を再利用するか、新しい招待を保存する。 */
  protected readonly invites: FriendInviteRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(ID_GENERATOR) ids: IdGenerator,
    @Inject(FRIEND_INVITE_REPOSITORY) invites: FriendInviteRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.ids = ids;
    this.invites = invites;
  }

  /**
   * ログイン利用者が招待リンクを取得できるようにし、有効な招待がなければ 1 件作成する。招待の承認やフレンド関係の作成は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: CreateFriendInviteInput): Promise<CreateFriendInviteOutput> {
    return todo("CreateFriendInviteUseCase");
  }
}
