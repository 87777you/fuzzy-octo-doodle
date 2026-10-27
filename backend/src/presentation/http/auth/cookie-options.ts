/**
 * 責務: Cookie の属性を、Express の `res.cookie` に渡せる形で表す型。
 * セッション Cookie の具体的な値は session-cookie.ts が持つ。
 */
export interface CookieOptions {
  /** true なら JavaScript から読めない（XSS でセッション ID を盗まれにくくする） */
  readonly httpOnly: boolean;
  /** true なら HTTPS のときだけ送る */
  readonly secure: boolean;
  /** 外部サイトからのリクエストに Cookie を付けるか。lax は、ページ遷移の GET 以外では付けない */
  readonly sameSite: "lax" | "strict" | "none";
  /** この Path 配下のリクエストにだけ Cookie を送る */
  readonly path: string;
  /** 有効期間（ミリ秒）。省略するとブラウザを閉じるまで */
  readonly maxAge?: number;
}
