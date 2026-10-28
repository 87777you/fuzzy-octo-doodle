import { todo } from "../../application/shared/todo.ts";
import type { ObjectStorage } from "../../application/ports/object-storage.port.ts";
import type { StoragePath } from "../../domain/shared/storage-path.ts";
import type { PhotoAccessGrant } from "../../domain/task/visibility-policy.ts";

/**
 * 責務: `ObjectStorage` port の実装。写真ファイルの保存先に対して、署名付き URL の発行と存在確認を行う。
 * 写真の中身は API サーバーを通さない。クライアントが署名付き URL へ直接アップロード・取得する。
 * 保存先の製品（GCS など）は未決定のため、実装を引き継ぐ。署名 URL の有効期限は引数で受け取る。
 *
 * 全体の流れ:
 * - IssueUploadUrls が `createSignedUploadUrl` を呼ぶ（アップロード用。パスは domain の issuePhotoPath がサーバー側で決める）。
 * - CompleteEvidenceUpload が `exists` を呼ぶ（クライアントが申告した写真が本当にあるかの確認）。
 * - ListEvidences が `createSignedReadUrl` を呼ぶ（閲覧用。権限判定の証明 PhotoAccessGrant が必須）。
 */
export class SignedUrlObjectStorage implements ObjectStorage {
  /** クライアントが PUT で直接アップロードするための短期署名 URL */
  createSignedUploadUrl(_path: StoragePath, _expiresInSec: number): Promise<string> {
    return todo("SignedUrlObjectStorage.createSignedUploadUrl");
  }

  /** 閲覧用の短期署名 URL。`authorizePhotoAccess` が発行した grant を要求し、権限判定を通さずには呼べない */
  createSignedReadUrl(_grant: PhotoAccessGrant, _path: StoragePath, _expiresInSec: number): Promise<string> {
    return todo("SignedUrlObjectStorage.createSignedReadUrl");
  }

  /** 指定のパスにオブジェクトが存在するか */
  exists(_path: StoragePath): Promise<boolean> {
    return todo("SignedUrlObjectStorage.exists");
  }
}
