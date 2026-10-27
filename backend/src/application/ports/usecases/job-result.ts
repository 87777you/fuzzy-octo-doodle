/**
 * 責務: 定期ジョブ 4 件が共通で返す結果の型。ジョブの入口（cron の別エントリーポイント）が、件数をログに出すために使う。
 */
export interface JobResult {
  /** 今回の実行で処理した件数 */
  processed: number;
}
