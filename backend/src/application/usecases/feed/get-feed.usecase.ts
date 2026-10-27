import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { POST_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { PostRepository } from "../../../application/ports/feed.repository.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import { USER_REPOSITORY } from "../../../application/ports/user.repository.ts";
import type { UserRepository } from "../../../application/ports/user.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { FeedItemView } from "../views.ts";

/** GetFeedUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetFeedInput {
  /** @CurrentUser() から受け取る認証済み利用者の ID。セッション認証済みの UserId である。 */
  userId: UserId;
  /** クエリ filter。Zod で all または objected に検証済みの一覧条件である。 */
  filter: "all" | "objected";
  /** クエリ cursor。未指定なら先頭ページ、指定時は Zod の形式検証後に Repository が位置を復元する。 */
  cursor?: string;
  /** クエリ limit。1ページに含める件数であり、Controller が Zod で数値として検証する。 */
  limit: number;
}

/** 閲覧可能な投稿を FeedItemView にまとめたページ。nextCursor は次ページがなければ null である。 */
export type GetFeedOutput = Page<FeedItemView>;

/**
 * 責務: タイムラインの1ページを読み、投稿・投稿者・タスク・リアクションを FeedItemView にまとめる。投稿やリアクションの更新は担わない。
 *
 * 全体の流れ:
 *   GET /api/feed
 *     → FeedController.feed（セッション利用者とクエリを検証）
 *     → この execute
 *     → PostRepository.listFeed
 *     → TaskRepository.findByIds / UserRepository.findByIds
 *     → toTaskView(task, "friend") で金額の公開条件を反映し、ページを返す。
 *
 * 処理:
 *   1. UnitOfWork.run の中で Clock.now() を取得し、FEED_WINDOW_DAYS を使って直近期間の開始時刻 since を求める。
 *   2. PostRepository.listFeed(tx, { viewer, filter, since, cursor, limit }) を呼ぶ。all は期間で絞り、objected は利用者が異議を申し立てたタスクを対象にする。
 *   3. ページ内の taskId と投稿者 ID を集め、TaskRepository.findByIds と UserRepository.findByIds で関連データを取得する。
 *   4. 各 FeedItem と関連データを FeedItemView に組み立て、タスクは toTaskView(task, "friend") で返す。
 *
 * 注意:
 *   - フレンド向けの FriendTaskView を使うため、ペナルティ金額はタスク所有者が公開にした場合だけ返る。
 *   - cursor を含むページングは createdAt と ID の順序を使い、次ページがなければ nextCursor は null となる。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class GetFeedUseCase {
  /** 一覧取得と関連データの読み取りを一貫したトランザクションにまとめる。 */
  protected readonly uow: UnitOfWork;
  /** 直近期間の開始時刻を現在時刻から計算する。 */
  protected readonly clock: Clock;
  /** 条件とページカーソルを指定して閲覧可能な投稿を取得する。 */
  protected readonly posts: PostRepository;
  /** 投稿に関連するタスクをまとめて取得し、表示用に変換する。 */
  protected readonly tasks: TaskRepository;
  /** 投稿者の利用者情報を取得して一覧に付加する。 */
  protected readonly users: UserRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
    @Inject(USER_REPOSITORY) users: UserRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.posts = posts;
    this.tasks = tasks;
    this.users = users;
  }

  /**
   * タイムラインの1ページを読み、投稿・投稿者・タスク・リアクションを FeedItemView にまとめる。投稿やリアクションの更新は担わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: GetFeedInput): Promise<GetFeedOutput> {
    return todo("GetFeedUseCase");
  }
}
