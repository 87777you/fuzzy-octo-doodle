import { z } from "zod";
import type { UserId } from "../domain/shared/ids.ts";
import { parseUserId } from "../domain/shared/id-parsers.ts";

/**
 * 責務: 開発用の固定利用者（環境変数 `DEV_AUTH_USER_ID`）を読み、検証済みの `UserId` か `null` にする。
 * `null` は、開発用の認証を使わない（本物の認証ガードを使う）ことを表す。
 *
 * 認証方式が決まるまで、メンバーが `curl` で API を試せるようにするための仕組み。本番では有効にしてはならないので、
 * `NODE_ENV=production` で設定されていたら、黙って無視せず、起動を失敗させる。
 *
 * @param env 通常は `process.env`
 * @throws ZodError / Error — UUID でない値、または本番で設定されているとき
 */
export function loadDevAuthUserId(env: NodeJS.ProcessEnv): UserId | null {
  const raw = z.string().min(1).optional().parse(env["DEV_AUTH_USER_ID"]);
  if (raw === undefined) return null;
  if (env["NODE_ENV"] === "production") {
    throw new Error("DEV_AUTH_USER_ID は開発用です。NODE_ENV=production では設定できません");
  }
  return parseUserId(raw);
}
