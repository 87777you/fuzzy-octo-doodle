import type { ErrorCode } from "../../../domain/shared/errors.ts";

/**
 * 責務: API が失敗したときに返すレスポンス本文の形（API 設計書のエラーレスポンス）を決める。
 *
 * 全体の流れ: AllExceptionsFilter が、あらゆる例外をこの形に変換して返す。フロントエンドは `error.code` で分岐する。
 */
export interface ErrorResponseBody {
  readonly error: {
    /** 失敗の種類。DomainError の code か、想定外の失敗を表す INTERNAL_ERROR（500）。詳細はログにだけ出す */
    readonly code: ErrorCode | "INTERNAL_ERROR";
    /** 人が読む説明。内部の情報（SQL、スタックトレース）は含めない */
    readonly message: string;
    /** code ごとの追加情報（入力の検証エラーの一覧など）。ないときは省略する */
    readonly details?: unknown;
  };
}
