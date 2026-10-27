
/** ExpireAdditionalEvidenceUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface ExpireAdditionalEvidenceInput {
  /** ジョブ起動側が指定する1回の処理上限。単位はタスク件数であり、外部入力かどうかは起動方式の決定後に検証する。 */
  batchSize: number;
}
