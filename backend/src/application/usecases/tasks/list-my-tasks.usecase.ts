import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import type { OwnerTaskView } from "../../../domain/task/task-view.ts";
import type { Page } from "../../../application/ports/task.repository.ts";
import type { TaskStatus } from "../../../domain/task/task-status.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** ListMyTasksUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ListMyTasksInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** クエリ文字列 view。active は進行中、history は終了済みの一覧で、コントローラが許可値を検証済み。 */
  view: "active" | "history";
  /** 任意の status クエリ。TaskStatus の許可値に一致することをコントローラで検証済み。 */
  status?: TaskStatus;
  /** 任意の search クエリ。タスク名の部分一致条件として使う文字列で、クエリ型を検証済み。 */
  search?: string;
  /** 任意の cursor クエリ。前ページの nextCursor をそのまま渡す不透明なページ位置である。 */
  cursor?: string;
  /** クエリ limit。返却件数の上限を表す整数で、許容範囲をコントローラで検証済み。 */
  limit: number;
}

/** 本人向けタスク表示のページ。items と次ページがある場合の nextCursor を含む。 */
export type ListMyTasksOutput = Page<OwnerTaskView>;

/**
 * 責務: 認証利用者のタスクを条件付きでカーソルページ取得し、本人向け表示型に変換する。検索・絞り込みの意味は repository に委ね、HTTP クエリの検証は担当しない。
 *
 * 全体の流れ:
 *   GET /api/tasks
 *     → TasksController.list（認証利用者とクエリを検証）
 *     → ListMyTasksUseCase.execute
 *     → UnitOfWork.run → TaskRepository.listByOwner
 *     → 各 Task を toTaskView(task, "owner") に変換
 *     → Page<OwnerTaskView> を TasksController から返す。
 *
 * 処理:
 *   1. UnitOfWork.run の中で ListMyTasksQuery を組み立て、TaskRepository.listByOwner(tx, query) を呼ぶ。repository が active/history、status、search、cursor、limit を適用する。
 *   2. 戻り値の items をそれぞれ toTaskView(task, "owner") に変換する。本人向けのため penaltyAmount を含む。
 *   3. 変換後の items と repository の nextCursor を Page<OwnerTaskView> として返す。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class ListMyTasksUseCase {
  /** TaskRepository.listByOwner の読み取りをトランザクション境界内で実行する。 */
  protected readonly uow: UnitOfWork;
  /** 指定条件に合う本人のタスクをカーソルページとして取得する。 */
  protected readonly tasks: TaskRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
  ) {
    this.uow = uow;
    this.tasks = tasks;
  }

  /**
   * 認証利用者のタスクを条件付きでカーソルページ取得し、本人向け表示型に変換する。検索・絞り込みの意味は repository に委ね、HTTP クエリの検証は担当しない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: ListMyTasksInput): Promise<ListMyTasksOutput> {
    return todo("ListMyTasksUseCase");
  }
}
