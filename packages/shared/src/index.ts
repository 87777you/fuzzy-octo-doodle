/** frontend と backend が共有する API 契約。 */

export type HealthResponse = {
  status: "ok";
};

export const HEALTH_PATH = "/healthz";

export function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { status?: unknown }).status === "ok"
  );
}
