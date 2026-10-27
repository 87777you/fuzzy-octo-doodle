import { SetMetadata } from "@nestjs/common";

/** `@Public()` が付けるメタデータのキー。SessionAuthGuard が Reflector で読む */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * 責務: 認証を要求しないエンドポイント（またはコントローラ全体）に付ける目印。
 *
 * 全体の流れ: 既定ではすべてのエンドポイントが認証必須（AuthModule が全体にガードを適用している）。
 * `@Public()` が付いたものだけ、SessionAuthGuard がセッションの検証をせずに通す。
 * 使う場面: ログイン、招待リンクの公開情報、死活監視。付ける数は最小にする。
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
