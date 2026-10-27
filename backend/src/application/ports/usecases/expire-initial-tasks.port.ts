
/** ExpireInitialTasksUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ExpireInitialTasksInput {
  /** jobs-main.ts が環境変数 JOB_BATCH_SIZE から渡す、1回の処理上限。単位はタスク件数。jobs-main.ts が正の整数であることを検証済み。 */
  batchSize: number;
}
