export function formatTaskCardDate(
  value: string,
  isHistory: boolean,
  includeTime: boolean,
): string {
  const date = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));

  return isHistory ? `作成日: ${date}` : date;
}
