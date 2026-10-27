/** switch の網羅性を型で保証する。列挙値が増えるとここでコンパイルエラーになる */
export function assertNever(value: never): never {
  throw new Error(`unreachable: ${JSON.stringify(value)}`);
}
