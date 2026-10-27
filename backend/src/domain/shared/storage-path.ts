import type { Brand } from "./brand.ts";
import { DomainError } from "./errors.ts";
import { brandAs } from "./brand.ts";

/**
 * オブジェクトストレージ（S3 互換）のキーとして使える文字列。parseStoragePath だけが作る。
 * ストレージを扱う関数（署名 URL の発行など）は、この型の値だけを受け付ける。
 */
export type StoragePath = Brand<string, "StoragePath">;

const MAX_KEY_BYTES = 1024;
/** S3 が「常に安全」とする文字（英数字と !-_.*'()）に、区切りの / を加えたもの */
const SAFE_KEY = /^[A-Za-z0-9!_.*'()/-]+$/;

export function parseStoragePath(raw: string): StoragePath {
  const invalid = (reason: string): never => {
    throw new DomainError("VALIDATION_ERROR", `ストレージのパスが不正です（${reason}）`);
  };
  if (raw.length === 0) return invalid("空");
  if (new TextEncoder().encode(raw).length > MAX_KEY_BYTES) return invalid("1024バイトを超える");
  if (!SAFE_KEY.test(raw)) return invalid("使えない文字を含む");
  if (raw.startsWith("/") || raw.endsWith("/") || raw.includes("//")) return invalid("区切りの位置が不正");
  if (raw.split("/").some((segment) => segment === "." || segment === "..")) return invalid("相対パスを含む");
  return brandAs<"StoragePath">()(raw);
}
