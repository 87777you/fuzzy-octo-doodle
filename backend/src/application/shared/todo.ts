/**
 * 責務: 「実装が済んでいない箇所に到達した」ことを表す例外。
 *
 * 全体の流れ: `todo()` が投げる。DomainError ではないため、例外フィルタ（AllExceptionsFilter）は
 * 想定外の例外として扱い、ログに残して 500 INTERNAL_ERROR を返す。
 * 骨格の段階でスキップされたエンドポイントを呼ぶと、この例外でスタックトレースから未実装の名前が分かる。
 */
export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`未実装です: ${name}`);
    this.name = "NotImplementedError";
  }
}

/**
 * 実装を引き継ぐ箇所の本体に置く目印。
 *
 * 使い方: `return todo("クラス名.メソッド名");` のように、関数の本体として置く。
 * `never` を返す関数なので、どの戻り値の型（Promise を含む）にもそのまま通り、型検査は成功する。
 * これにより「型と依存の形は確定していて、本体だけが空」という状態を、コンパイルが通る形で表せる。
 *
 * 実装する人の手順: 本体を書いて `todo(...)` の呼び出しを消す。
 * 残りの数は `grep -r "todo(" backend/src | wc -l` で数える。完了の条件は、0 件になることと、
 * 型検査・lint・テスト・ビルドが通ること。
 *
 * @param name 未実装の場所の名前。例外のメッセージに入るので、クラス名とメソッド名にする。
 */
export function todo(name: string): never {
  throw new NotImplementedError(name);
}
