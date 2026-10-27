import type { CookieOptions } from "./cookie-options.ts";

/** セッション Cookie の名前。SessionAuthGuard が読み、ログイン処理（認証の担当）が書く */
export const SESSION_COOKIE_NAME = "session";

/**
 * 責務: セッション Cookie に付ける属性を 1 か所で決める。ログイン処理が `res.cookie(名前, 値, この属性)` で使う。
 *
 * 各属性の理由:
 * - HttpOnly: JavaScript から読めない。XSS が起きても、セッション ID を盗まれにくい。
 * - Secure: HTTPS のときだけ送る。
 * - SameSite=Lax: 外部サイトからの POST などでは Cookie を送らない。CSRF 対策の 1 層目（2 層目は OriginGuard）。
 * - Path=/api: API のリクエストにだけ送る。ページ（SSR）のリクエストには送らない。
 *   認証が必要なデータは、ブラウザから /api 経由で取得する前提のため。
 * - Domain は指定しない: 発行したホストだけに限定される。
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/api",
} as const satisfies CookieOptions;
