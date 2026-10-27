import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { DomainError } from "../../../domain/shared/errors.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { AuthenticatedRequest } from "./authenticated-request.ts";

/**
 * 責務: コントローラの引数で、リクエストした利用者の ID（UserId）を受け取るためのデコレータ。
 * request から `userId` を取り出す処理を、各ハンドラに書かせないために 1 か所にまとめる。
 *
 * 全体の流れ: SessionAuthGuard が `request.userId` を載せる → このデコレータが取り出す → ハンドラの引数になる。
 * ガードを通っていれば `userId` は必ずある。`@Public()` のエンドポイントで使うと、ない状態なので 401 になる。
 * 値は検証済みの名目型（UserId）なので、ハンドラは再検証せずにユースケースへ渡してよい。
 *
 * 例: `create(@CurrentUser() owner: UserId, @Body() body: unknown)`
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): UserId => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (request.userId === undefined) throw new DomainError("UNAUTHENTICATED", "ログインが必要です");
  return request.userId;
});
