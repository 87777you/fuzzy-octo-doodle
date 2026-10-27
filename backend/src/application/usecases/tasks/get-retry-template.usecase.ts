import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { TASK_REPOSITORY } from "../../../application/ports/task.repository.ts";
import type { TaskRepository } from "../../../application/ports/task.repository.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** 再挑戦フォームへ入れる元タスクの値。保存や状態遷移を表す型ではない。 */
export interface RetryTemplate {
  /** 元タスクから引き継ぐタイトル。 */
  title: string;
  /** 元タスクから引き継ぐ達成条件。 */
  achievementCondition: string;
  /** 元タスクから引き継ぐ証拠提出方法。 */
  evidenceMethod: string;
  /** 元タスクから引き継ぐペナルティ額。単位は円。 */
  penaltyAmount: number;
  /** 元タスクから引き継ぐペナルティ額の公開設定。 */
  isPenaltyPublic: boolean;
  /** 再挑戦元のタスク ID。新しいタスク作成時に originalTaskId として送る値。 */
  originalTaskId: TaskId;
}

/** GetRetryTemplateUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetRetryTemplateInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: string;
}

/** 再挑戦フォームの初期値。保存処理は行わず、送信後の新規作成は CreateTaskUseCase が担う。 */
export type GetRetryTemplateOutput = RetryTemplate;

/**
 * 責務: 本人が所有するタスクから再挑戦フォーム用の初期値を返す。新しいタスクの作成や元タスクの変更は行わない。
 *
 * 全体の流れ:
 *   GET /api/tasks/{id}/retry-template
 *     → TasksController.retryTemplate（認証利用者と :id を検証）
 *     → GetRetryTemplateUseCase.execute
 *     → TaskRepository.findById
 *     → 所有者を照合し RetryTemplate を返す
 *   フォーム送信後は POST /api/tasks の CreateTaskUseCase が新しいタスクを作る。
 *
 * 処理:
 *   1. parseTaskId 済みの taskId で UnitOfWork.run 内から TaskRepository.findById(tx, taskId) を呼ぶ。見つからなければ NOT_FOUND を返す。
 *   2. 取得した task.ownerId と userId を比較する。一致しない場合は所有物の存在を知らせず NOT_FOUND を返す。
 *   3. title、achievementCondition、evidenceMethod、penaltyAmount、isPenaltyPublic、originalTaskId を RetryTemplate に詰めて返す。保存やタスク状態の変更はしない。
 *
 * 失敗:
 *   - DomainError("NOT_FOUND"): 指定したタスクがない、または利用者が所有していない。
 *
 * この層（application）は NestJS の HTTP を知らない。入力は Input、結果は Output、失敗は DomainError だけで表す。
 */
@Injectable()
export class GetRetryTemplateUseCase {
  /** 元タスクの取得を読み取りトランザクション境界内で行う。 */
  protected readonly uow: UnitOfWork;
  /** 再挑戦元となるタスクを ID で取得する。 */
  protected readonly tasks: TaskRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(TASK_REPOSITORY) tasks: TaskRepository,
  ) {
    this.uow = uow;
    this.tasks = tasks;
  }

  /**
   * 本人が所有するタスクから再挑戦フォーム用の初期値を返す。新しいタスクの作成や元タスクの変更は行わない。
   * 本体は未実装（todo）。上の「処理」の順に実装する。
   */
  execute(_input: GetRetryTemplateInput): Promise<GetRetryTemplateOutput> {
    return todo("GetRetryTemplateUseCase");
  }
}
