import type { PhotoAccessGrant } from "../../domain/task/visibility-policy.ts";

export interface ObjectStorage {
  /** クライアントが直接PUTする短期署名URL */
  createSignedUploadUrl(path: string, expiresInSec: number): Promise<string>;
  /**
   * 閲覧用の短期署名URL（例: 60秒）。
   * authorizePhotoAccess が発行した grant を要求するため、権限判定を通さずには呼べない。
   */
  createSignedReadUrl(grant: PhotoAccessGrant, path: string, expiresInSec: number): Promise<string>;
  exists(path: string): Promise<boolean>;
}
export const OBJECT_STORAGE = Symbol("ObjectStorage");
