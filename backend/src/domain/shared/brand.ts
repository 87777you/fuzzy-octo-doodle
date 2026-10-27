declare const brand: unique symbol;

/** 名目型。検証済みの値や権限の証明を、通常の string / number と区別するために使う */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

/**
 * 値に名目型を付ける。検証を済ませた `parse*` / `authorize*` 関数や、
 * DB から読んだ値を信頼できる境界（infrastructure の mapper）だけで使う。
 * 型の変換（as）をリポジトリ全体で禁止しているため、名目型を付ける変換はここ 1 か所に集約している。
 *
 * 例: `brandAs<"TaskDeadline">()(deadline)`
 */
export const brandAs =
  <const B extends string>() =>
  <T>(value: T): Brand<T, B> =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- 名目型を付ける唯一の変換。呼び出し側が検証済みであることを保証する
    value as Brand<T, B>;
