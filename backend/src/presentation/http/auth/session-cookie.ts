import type { CookieOptions } from "./cookie-options.ts";

/** セッション Cookie の名前 */
export const SESSION_COOKIE_NAME = "session";

/**
 * セッション Cookie の属性。
 * - HttpOnly: JavaScript から読めない
 * - Secure: HTTPS のときだけ送る
 * - SameSite=Lax: 外部サイトからの POST などでは送られない
 * - Path=/api: API だけに送る（ページには送られない）
 * - Domain は指定しない: 発行したホストだけに限定される
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/api",
} as const satisfies CookieOptions;
