/**
 * 状態遷移の結果。
 * - next: 遷移後の状態。元の値は書き換えない
 * - events: 遷移で起きた出来事。application 層が投稿・通知・請求依頼へ変換する
 *
 * 遷移関数の戻り値の型として、domain の外からも見える（ユースケースが `{ next, events }` を受け取る）。
 * 集約ごとの別名は `TaskTransition` のように、その集約のファイルで定義する。
 */
export interface Transition<S, E> {
  readonly next: S;
  readonly events: readonly E[];
}
