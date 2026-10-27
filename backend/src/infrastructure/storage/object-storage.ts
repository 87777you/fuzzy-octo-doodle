import { todo } from "../../application/shared/todo.ts";
import type { ObjectStorage } from "../../application/ports/object-storage.port.ts";
import type { StoragePath } from "../../domain/shared/storage-path.ts";
import type { PhotoAccessGrant } from "../../domain/task/visibility-policy.ts";

/**
 * 写真の保存先（署名付き URL の発行と存在確認）。保存先の製品（GCS など）は未決定のため、実装を引き継ぐ。
 * 署名 URL の有効期限は引数で受け取る。
 */
export class SignedUrlObjectStorage implements ObjectStorage {
  createSignedUploadUrl(_path: StoragePath, _expiresInSec: number): Promise<string> {
    return todo("SignedUrlObjectStorage.createSignedUploadUrl");
  }

  createSignedReadUrl(_grant: PhotoAccessGrant, _path: StoragePath, _expiresInSec: number): Promise<string> {
    return todo("SignedUrlObjectStorage.createSignedReadUrl");
  }

  exists(_path: StoragePath): Promise<boolean> {
    return todo("SignedUrlObjectStorage.exists");
  }
}
