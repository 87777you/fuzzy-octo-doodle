import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { OBJECTION_REPOSITORY } from "../../../application/ports/objection.repository.ts";
import type { ObjectionRepository } from "../../../application/ports/objection.repository.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { ObjectionSummary } from "../views.ts";

/** ListMyObjectionsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListMyObjectionsInput {
  /** 認証済みセッションの利用者 ID。CurrentUser から渡り、UserId として検証済みである。 */
  userId: UserId;
  /** クエリのページ位置を示すカーソル。controller で文字列として検証済みで、省略時は先頭ページである。 */
  cursor?: string;
  /** クエリの取得件数。controller で許容範囲を検証済みの整数である。 */
  limit: number;
}

/** 自分が申し立てた異議のページ。items は ObjectionSummary、nextCursor は次ページがない場合に null となる。 */
export type ListMyObjectionsOutput = Page<ObjectionSummary>;

/**
 * 責務: ログイン利用者が申し立てた異議をページ単位で返す。タスクの写真や他人が申し立てた異議はこの一覧に含めない。
 *
 * 全体の流れ:
 *   GET /api/me/objections
 *     → 全体のセッションガード → ObjectionsController.listMine（query 検証）
 *     → この execute → ObjectionRepository.listByObjector → ObjectionSummary のページを返す。
 *
 * 処理:
 *   1. UnitOfWork.run を開始し、cursor と limit をそのまま一覧条件に使う。
 *   2. ObjectionRepository.listByObjector に tx、userId、cursor、limit を渡し、自分が申立人である異議だけを取得する。
 *   3. Page.items を ObjectionSummary に写し、nextCursor を維持して返す。本人が申立人であるため理由を表示できるが、判定確定後を含め写真 URL は取得・返却しない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ListMyObjectionsUseCase {
  /** 一覧取得を UnitOfWork.run の読み取りトランザクション内で実行する。 */
  protected readonly uow: UnitOfWork;
  /** 現在の利用者が申し立てた異議をカーソルと件数で取得する。 */
  protected readonly objections: ObjectionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(OBJECTION_REPOSITORY) objections: ObjectionRepository,
  ) {
    this.uow = uow;
    this.objections = objections;
  }

  /**
   * ログイン利用者が申し立てた異議をページ単位で返す。タスクの写真や他人が申し立てた異議はこの一覧に含めない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ListMyObjectionsInput): Promise<ListMyObjectionsOutput> {
    return todo("ListMyObjectionsUseCase");
  }
}
