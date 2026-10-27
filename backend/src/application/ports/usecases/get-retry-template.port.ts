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
  taskId: TaskId;
}

/** 再挑戦フォームの初期値。保存処理は行わず、送信後の新規作成は CreateTaskUseCase が担う。 */
export type GetRetryTemplateOutput = RetryTemplate;
