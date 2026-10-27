import type { ErrorCode } from "../../../domain/shared/errors.ts";

/** エラー時のレスポンス本文。500 のときの code は INTERNAL_ERROR で、詳細はログにだけ出す */
export interface ErrorResponseBody {
  readonly error: {
    readonly code: ErrorCode | "INTERNAL_ERROR";
    readonly message: string;
    readonly details?: unknown;
  };
}
