import type { PhotoExtension } from "../../../domain/evidence/upload-session.ts";
import type { PhotoSlot } from "../../../domain/evidence/upload-session.ts";
import type { TaskId } from "../../../domain/shared/ids.ts";
import type { UploadSessionId } from "../../../domain/shared/ids.ts";
import type { StoragePath } from "../../../domain/shared/storage-path.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

/** 写真ごとに発行した、サーバー生成パスとアップロード用 URL の一覧。 */
export interface UploadUrlsResult {
  /** 入力の photos と同じ枠ごとのアップロード情報。 */
  uploads: readonly {
    /** 対象写真の枠番号（1〜3）。 */
    slot: PhotoSlot;
    /** 対象セッション配下にサーバーが決めたストレージパス。issuePhotoPath が作る。 */
    path: StoragePath;
    /** path へクライアントが直接 PUT するための短期署名付き URL。 */
    uploadUrl: string;
  }[];
}

/** IssueUploadUrlsUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface IssueUploadUrlsInput {
  /** 認証済みセッションから得た利用者 ID。@CurrentUser() で名目型として検証済み。 */
  userId: UserId;
  /** URL の :id パス値。コントローラが UUID 形式を検証し TaskId に変換して渡す。 */
  taskId: TaskId;
  /** URL の :sessionId パス値。コントローラが UUID 形式を検証し UploadSessionId に変換して渡す。 */
  sessionId: UploadSessionId;
  /** リクエスト本文の写真枠と拡張子。配列形式を検証済みで、slot は 1〜3、extension は jpg/png/webp に限る。 */
  photos: readonly {
    /** 写真の枠番号。単位は 1〜3 の番号で、コントローラが許可値を検証済み。 */
    slot: PhotoSlot;
    /** 写真ファイルの拡張子。jpg、png、webp のいずれかで、コントローラが許可値を検証済み。 */
    extension: PhotoExtension;
  }[];
}
