export type SubmissionType = "initial" | "additional";
export interface EvidenceTask {
  id: string;
  title: string;
  deadlineAt: string;
  status: string;
  viewer: "owner" | "friend";
}
export interface EvidenceItem {
  submissionType: SubmissionType;
  submittedAt: string;
  photoUrls: string[];
}

const apiRoot = "/api/tasks";

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "include", ...init });
  if (!response.ok) {
    let message = `通信に失敗しました（${String(response.status)}）`;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "message" in body) {
        const value = body.message;
        if (typeof value === "string") message = value;
      }
    } catch {
      // エラーレスポンスがJSONでない場合
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

const taskUrl = (id: string) => `${apiRoot}/${encodeURIComponent(id)}`;
const jsonHeaders = { "Content-Type": "application/json" };

export function getEvidenceTask(id: string) {
  return jsonRequest<EvidenceTask>(taskUrl(id));
}
export function listEvidence(id: string) {
  return jsonRequest<{ evidences: EvidenceItem[] }>(`${taskUrl(id)}/evidences`);
}

function extensionOf(file: File): "jpg" | "png" | "webp" {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  throw new Error("JPG、PNG、WebPの写真のみ選択できます");
}

export async function submitEvidence(
  taskId: string,
  type: SubmissionType,
  files: File[],
): Promise<void> {
  if (files.length < 1 || files.length > 3) {
    throw new Error("証拠写真を1〜3枚選択してください");
  }
  const base = `${taskUrl(taskId)}/evidence-upload-sessions`;
  const session = await jsonRequest<{ id: string }>(base, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ submissionType: type }),
  });
  const sessionUrl = `${base}/${encodeURIComponent(session.id)}`;
  const issued = await jsonRequest<{
    uploads: { slot: number; path: string; uploadUrl: string }[];
  }>(`${sessionUrl}/upload-urls`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      photos: files.map((file, index) => ({
        slot: index + 1,
        extension: extensionOf(file),
      })),
    }),
  });

  const paths: string[] = [];
  for (const [index, file] of files.entries()) {
    const upload = issued.uploads.find((entry) => entry.slot === index + 1);
    if (!upload) throw new Error("アップロード先が取得できませんでした");
    const result = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!result.ok) {
      throw new Error(`写真${String(index + 1)}のアップロードに失敗しました`);
    }
    paths.push(upload.path);
  }

  await jsonRequest(`${sessionUrl}/complete`, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({ photoPaths: paths }),
  });
}
