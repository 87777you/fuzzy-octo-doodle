declare const brand: unique symbol;

/** 名目型。検証済みの値や権限の証明を、通常の string / number と区別するために使う */
export type Brand<T, B extends string> = T & { readonly [brand]: B };
