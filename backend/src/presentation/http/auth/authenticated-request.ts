import type { UserId } from "../../../domain/shared/ids.ts";

/** 認証ガードが userId を載せたリクエスト。認証前は userId がない */
export interface AuthenticatedRequest {
  userId?: UserId;
  readonly method: string;
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  /** cookie-parser などで解析した Cookie。未導入の間は undefined */
  readonly cookies?: Readonly<Record<string, string | undefined>>;
}
