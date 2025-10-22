// src/services/calendarService.ts
import axios from "axios";
import { startOfDay, endOfDay } from "date-fns"; // 日付範囲指定のため
import type { CalendarEvent } from "../types/calendar";

const DEFAULT_INTENSITY = 3; // Home.tsxから移動

/**
 * Google Calendar APIから指定された日付範囲のイベントを取得する関数
 * @param token Google APIアクセストークン
 * @param timeMin 取得開始日時 (ISO文字列)
 * @param timeMax 取得終了日時 (ISO文字列)
 * @returns CalendarEventの配列 (Promise)
 */
export const fetchGoogleCalendarEvents = async (
  token: string,
  timeMin: string = startOfDay(new Date()).toISOString(), // デフォルトは今日
  timeMax: string = endOfDay(new Date()).toISOString() // デフォルトは今日
): Promise<CalendarEvent[]> => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          maxResults: 50, // 取得件数を増やす (任意)
          orderBy: "startTime",
          singleEvents: true,
          timeMin: timeMin,
          timeMax: timeMax,
        },
      }
    );

    const fetched: CalendarEvent[] = res.data.items.map((ev: any) => ({
      id: ev.id,
      summary: ev.summary || "（タイトルなし）",
      start: ev.start.dateTime || ev.start.date, //終日イベントも考慮
      end: ev.end.dateTime || ev.end.date, //終日イベントも考慮
      intensity: DEFAULT_INTENSITY, // デフォルト強度
      source: "google", // 取得元を明示 (任意)
    }));

    // 重複を削除 (Home.tsxからロジックを移動)
    const seen = new Map<string, CalendarEvent>();
    for (const ev of fetched) {
      // icalUIDが存在すればそれをキーに、なければ簡易的なキーを作成
      const key =
        (ev as any).iCalUID ||
        `${ev.summary}-${new Date(ev.start).toISOString()}-${new Date(
          ev.end
        ).toISOString()}`; // より確実なキーに変更
      if (!seen.has(key)) seen.set(key, ev);
    }
    return Array.from(seen.values());
  } catch (err: any) {
    console.error("Googleカレンダーイベント取得エラー:", err);
    // エラーを再スローして呼び出し元で処理できるようにする
    throw err;
  }
};
