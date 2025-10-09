// src/utils/calculateBalance.ts
export type BalanceStatus = "good" | "normal" | "tired";

/**
 * 睡眠時間・予定数・予定時間からバランス指数を算出
 * @param sleepHours 睡眠時間（h）
 * @param plannedEvents 当日の予定数
 * @param totalPlannedHours 予定総時間（h）
 * @param maxEvents 理想的な予定数（デフォルト3）
 */
export function calculateBalanceStatus(
  sleepHours: number,
  plannedEvents: number,
  totalPlannedHours: number,
  maxEvents = 3
): { score: number; status: BalanceStatus } {
  // 睡眠：7〜8hで100点
  const sleepScore = Math.min((sleepHours / 8) * 100, 100);

  // 予定数：理想値との差を考慮
  const eventCountScore = Math.max(
    100 - Math.abs(plannedEvents - maxEvents) * 25,
    0
  );

  // 総時間：4hが理想、8h超で50点以下
  const scheduleScore = Math.max(100 - Math.abs(totalPlannedHours - 4) * 15, 0);

  // 加重平均
  const balanceScore =
    sleepScore * 0.5 + eventCountScore * 0.25 + scheduleScore * 0.25;

  // ステータス分類
  let status: BalanceStatus;
  if (balanceScore >= 80) status = "good";
  else if (balanceScore >= 50) status = "normal";
  else status = "tired";

  return { score: Math.round(balanceScore), status };
}
