/** `todo()` が実行されたときに投げる。実装が済んでいない箇所に到達したことを表す */
export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`未実装です: ${name}`);
    this.name = "NotImplementedError";
  }
}

/**
 * 実装を引き継ぐ箇所の本体に置く目印。`never` を返すので、どの戻り値の型にもそのまま通る。
 * 残りの数は `grep -r "todo(" backend/src | wc -l` で数える。実装したら、この呼び出しを消す。
 */
export function todo(name: string): never {
  throw new NotImplementedError(name);
}
