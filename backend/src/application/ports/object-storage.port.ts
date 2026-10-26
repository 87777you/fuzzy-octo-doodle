export interface ObjectStorage {
  /** クライアントが直接PUTする短期署名URL */
  createSignedUploadUrl(path: string, expiresInSec: number): Promise<string>;
  /** 閲覧用の短期署名URL（例: 60秒）。権限判定は呼び出し側で済ませること */
  createSignedReadUrl(path: string, expiresInSec: number): Promise<string>;
  exists(path: string): Promise<boolean>;
}
export const OBJECT_STORAGE = Symbol("ObjectStorage");
