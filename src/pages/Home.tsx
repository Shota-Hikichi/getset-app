// src/pages/Home.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react"; // useCallback をインポート
import { addDays, startOfDay, endOfDay } from "date-fns"; // startOfDay と endOfDay をインポート
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import HeaderDateNav from "../components/HeaderDateNav";
import TodayConditionCard from "../components/TodayConditionCard";
import PrimaryCTA from "../components/PrimaryCTA";
import GoogleCalendar from "../components/GoogleCalendar";
import Footer from "../components/Footer";

import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
import { useGoogleAuthStore } from "../stores/useGoogleAuthStore";
import { findRechargeGaps } from "../utils/findRechargeGap";
// googleApi は使わなくなるので削除 (またはコメントアウト)
// import googleApi from "../lib/googleApi";

import type { CalendarEvent } from "../types/calendar";

const DEFAULT_INTENSITY = 3;

// ===== 👇 ここから修正 (fetchCalendarEvents を useEffect の外に出す) 👇 =====
/**
 * Google Calendar API から指定された日付のイベントを取得する
 * @param token アクセストークン
 * @param date 取得対象の日付
 */
const fetchCalendarEvents = async (
  token: string,
  date: Date
): Promise<CalendarEvent[]> => {
  // 取得する日付の 00:00:00
  const timeMin = startOfDay(date).toISOString();
  // 取得する日付の 23:59:59
  const timeMax = endOfDay(date).toISOString();

  try {
    const res = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          maxResults: 50, // 1日の予定として十分な数を指定
          orderBy: "startTime",
          singleEvents: true,
          timeMin: timeMin, // 修正: 今ではなく、指定日の開始時刻
          timeMax: timeMax, // 修正: 指定日の終了時刻
        },
      }
    );

    const fetched = res.data.items.map((ev: any) => ({
      id: ev.id,
      summary: ev.summary || "（タイトルなし）",
      start: ev.start.dateTime || ev.start.date,
      end: ev.end.dateTime || ev.end.date,
      intensity: DEFAULT_INTENSITY,
    }));

    // 重複除去 (念のため)
    const seen = new Map<string, CalendarEvent>();
    for (const ev of fetched) {
      const key =
        (ev as any).iCalUID ||
        `${ev.summary}-${new Date(ev.start).getHours()}-${new Date(
          ev.end
        ).getHours()}`;
      if (!seen.has(key)) seen.set(key, ev);
    }
    return Array.from(seen.values());
  } catch (err) {
    console.error("カレンダー取得失敗:", err);
    // エラーを投げて呼び出し元で処理させる
    throw err;
  }
};
// ===== 👆 ここまで修正 👆 =====

const Home: React.FC = () => {
  // ストアからロジックとアクションを取得
  const fetchData = useRechargesStore((s) => s.fetchData);
  const addSlot = useRechargesStore((s) => s.addSlot);
  const getFilteredRecharges = useRechargesStore((s) => s.getFilteredRecharges);
  const getActiveRule = useRechargesStore((s) => s.getActiveRule);
  const rechargeSlots = useRechargesStore((s) => s.slots);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // fetchedRef は不要になったので削除
  // const fetchedRef = useRef(false);
  const [calendarLoading, setCalendarLoading] = useState(false); // 修正: ローディング状態を追加

  const { sleepHours, maxEvents, totalDuration, balanceScore, balanceStatus } =
    useProgressStore();

  const { accessToken } = useGoogleAuthStore();

  const googleLoginConfig = useMemo(
    () => ({
      flow: "auth-code",
      // @ts-ignore
      prompt: "none",
      scope:
        "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
      onSuccess: async (codeResponse: any) => {
        // ...
      },
    }),
    []
  );

  const silentLogin = useGoogleLogin(googleLoginConfig as any);

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("ストアのデータ取得に失敗:", err);
    });
  }, [fetchData]);

  // ===== 👇 ここから修正 (カレンダー取得ロジックの変更) 👇 =====
  useEffect(() => {
    // 認証トークンがない場合は何もしない
    if (!accessToken) {
      // (もしトークンがない場合にログインを促すなら)
      // silentLogin();
      return;
    }

    setCalendarLoading(true);

    // useCallback を使った関数を呼び出す
    const loadEvents = async () => {
      try {
        const fetched = await fetchCalendarEvents(accessToken, currentDate);
        setEvents(fetched);
      } catch (err: any) {
        if (err.response?.status === 401) {
          // トークン切れの可能性
          silentLogin(); // 再認証を試みる
        }
      } finally {
        setCalendarLoading(false);
      }
    };

    loadEvents();

    // 依存配列に accessToken と currentDate を追加
    // これにより、日付が変わるたびにこの useEffect が再実行される
  }, [accessToken, currentDate, silentLogin]);
  // ===== 👆 ここまで修正 👆 =====

  const prevDay = () => setCurrentDate((d) => addDays(d, -1));
  const nextDay = () => setCurrentDate((d) => addDays(d, 1));

  // ---- リチャージ追加 ----
  const handleAddRecharge = () => {
    const durationMin = 30;

    // 1. Googleの予定(events)とストアの予定(rechargeSlots)を合体させる
    const allBusyTimes = [
      ...events.map((e) => ({ start: e.start, end: e.end })),
      ...rechargeSlots.map((s) => ({ start: s.start, end: s.end })),
    ];

    // 2. 合体したリストで空き時間（ギャップ）を探す
    const gaps = findRechargeGaps(allBusyTimes, durationMin);

    if (gaps.length === 0) {
      alert("リチャージを挿入できる時間帯が見つかりませんでした");
      return;
    }

    const randomGap = gaps[Math.floor(Math.random() * gaps.length)];
    const start = new Date(randomGap.start);
    const end = new Date(start.getTime() + durationMin * 60000);

    const candidates = getFilteredRecharges();
    const activeRule = getActiveRule();

    let categoryToAdd: string | null = null;

    if (candidates.length > 0) {
      const availableCategories = Array.from(
        new Set(candidates.map((c) => c.category!))
      );
      const randomIndex = Math.floor(
        Math.random() * availableCategories.length
      );
      categoryToAdd = availableCategories[randomIndex];
      console.log(
        `✅ 候補カテゴリ [${availableCategories.join(
          ", "
        )}] からランダムに選択:`,
        categoryToAdd
      );
    } else if (
      activeRule &&
      activeRule.categories &&
      activeRule.categories.length > 0
    ) {
      const availableCategories = activeRule.categories;
      const randomIndex = Math.floor(
        Math.random() * availableCategories.length
      );
      categoryToAdd = availableCategories[randomIndex];
      console.log(
        `⚠️ フォールバックカテゴリ [${availableCategories.join(
          ", "
        )}] からランダムに選択:`,
        categoryToAdd
      );
    }

    // 3. 選ばれたカテゴリがあれば、スロットを追加
    if (categoryToAdd) {
      addSlot({
        start: start.toISOString(),
        end: end.toISOString(),
        category: categoryToAdd,
        label: categoryToAdd,
      });
    } else {
      alert(
        "現在提案できるリチャージがありません。管理画面でルールを設定してください。"
      );
    }
  };

  // ---- レンダリング ----
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2b7db3] via-[#3aa1d9] to-[#69c2ec] text-slate-900 flex flex-col pb-24">
      <div className="pt-4">
        <HeaderDateNav
          date={currentDate}
          onPrev={prevDay}
          onNext={nextDay}
          className="mx-auto max-w-[480px]"
        />
      </div>
      <main className="flex-1 mx-auto w-full max-w-[480px] px-4 mt-2 space-y-6">
        <section>
          <h2 className="text-white/95 text-lg font-semibold mb-2">
            今日のコンディション
          </h2>
          <TodayConditionCard
            title="バランス指数"
            events={events} // events は日付フィルタリング済みのもの
            balanceScore={balanceScore}
            status={balanceStatus}
            sleepHours={sleepHours}
            maxEvents={maxEvents}
            totalDuration={totalDuration}
          />
        </section>
        <section>
          <PrimaryCTA
            label="リチャージを予定に入れる"
            onClick={handleAddRecharge}
          />
        </section>
        <section className="mb-8">
          <h2 className="text-white/95 text-lg font-semibold mb-2">
            今日の予定
          </h2>
          <div className="rounded-2xl bg-white/15 p-4 text-white/90 ring-1 ring-white/20">
            {/* 修正: calendarLoading 状態を渡す (任意) */}
            {calendarLoading ? (
              <div className="text-center text-white/80">
                予定を読み込み中...
              </div>
            ) : (
              <GoogleCalendar events={events} currentDate={currentDate} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
