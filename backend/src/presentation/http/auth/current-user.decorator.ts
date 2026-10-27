import { createParamDecorator } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { DomainError } from "../../../domain/shared/errors.ts";
import type { UserId } from "../../../domain/shared/ids.ts";
import type { AuthenticatedRequest } from "./authenticated-request.ts";

/**
 * コントローラの引数で、リクエストしたユーザーの ID を受け取る。
 * 認証ガードを通っていればユーザー ID が必ずあり、通っていない（`@Public()` の）エンドポイントで使うと 401 になる。
 *
 * 例: `create(@CurrentUser() owner: UserId, @Body() body: unknown)`
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): UserId => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (request.userId === undefined) throw new DomainError("UNAUTHENTICATED", "ログインが必要です");
  return request.userId;
});
