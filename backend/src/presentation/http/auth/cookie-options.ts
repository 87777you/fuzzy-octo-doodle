/** Cookie の属性（Express の res.cookie に渡せる形） */
export interface CookieOptions {
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: "lax" | "strict" | "none";
  readonly path: string;
  readonly maxAge?: number;
}
