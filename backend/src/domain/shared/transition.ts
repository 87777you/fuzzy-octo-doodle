/** 状態遷移の結果。遷移後の状態と、application 層が投稿・通知・請求へ変換するイベント */
export interface Transition<S, E> {
  readonly next: S;
  readonly events: readonly E[];
}
