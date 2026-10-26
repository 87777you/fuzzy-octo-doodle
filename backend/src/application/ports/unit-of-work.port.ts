/** 不透明なトランザクションハンドル。実装（infra）だけが中身を知る */
declare const txBrand: unique symbol;
export interface Tx {
  readonly [txBrand]: true;
}

export interface UnitOfWork {
  /** fn 全体を1トランザクションで実行。例外でロールバック */
  run<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}
export const UNIT_OF_WORK = Symbol("UnitOfWork");
