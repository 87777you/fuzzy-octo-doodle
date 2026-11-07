export function getAppliedConditionsLabel(
  appliedSearch: string,
  selectedStatusLabel?: string,
): string {
  const conditions = [
    ...(appliedSearch ? [`検索「${appliedSearch}」`] : []),
    ...(selectedStatusLabel ? [`状態「${selectedStatusLabel}」`] : []),
  ];

  return `適用中の条件: ${conditions.length > 0 ? conditions.join("、") : "なし"}`;
}

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
