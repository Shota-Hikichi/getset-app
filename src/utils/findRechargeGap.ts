// src/utils/findRechargeGap.ts
import type { CalendarEvent } from "../types/calendar";

// ✅ 汎用的な型に変更 (start と end があればOK)
type EventTime = {
  start: string;
  end: string;
};

// 空き時間の幅（分）を指定して、その中からリチャージ可能な隙間を抽出
export function findRechargeGaps(
  allEvents: EventTime[], // ✅ 型を EventTime[] に変更
  durationMinutes: number
): { start: string; end: string }[] {
  // ソートされたイベントリストを作成
  const sorted = [...allEvents].sort(
    // ✅ allEvents を使用
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const gaps: { start: string; end: string }[] = [];

  const dayStart = new Date(sorted[0]?.start || new Date());
  dayStart.setHours(7, 0, 0, 0); // 07:00開始
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 0, 0, 0); // 23:00終了

  // 最初の予定の前
  if (
    sorted.length === 0 ||
    new Date(sorted[0].start).getTime() > dayStart.getTime()
  ) {
    const gapEnd = sorted[0] ? new Date(sorted[0].start) : dayEnd;
    if ((gapEnd.getTime() - dayStart.getTime()) / 60000 >= durationMinutes) {
      gaps.push({ start: dayStart.toISOString(), end: gapEnd.toISOString() });
    }
  }

  // 各予定の間
  for (let i = 0; i < sorted.length - 1; i++) {
    const currEnd = new Date(sorted[i].end);
    const nextStart = new Date(sorted[i + 1].start);
    const gap = (nextStart.getTime() - currEnd.getTime()) / 60000;
    if (gap >= durationMinutes) {
      gaps.push({ start: currEnd.toISOString(), end: nextStart.toISOString() });
    }
  }

  // 最後の予定の後
  const lastEnd = new Date(sorted[sorted.length - 1]?.end || dayStart);
  if ((dayEnd.getTime() - lastEnd.getTime()) / 60000 >= durationMinutes) {
    gaps.push({ start: lastEnd.toISOString(), end: dayEnd.toISOString() });
  }

  return gaps;
}
