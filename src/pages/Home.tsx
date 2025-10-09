// src/pages/Home.tsx
import React, { useState, useEffect, useRef } from "react";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import HeaderDateNav from "../components/HeaderDateNav";
import TodayConditionCard from "../components/TodayConditionCard";
import PrimaryCTA from "../components/PrimaryCTA";
import GoogleCalendar from "../components/GoogleCalendar";
import Footer from "../components/Footer";

import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
import { useGoogleAuthStore } from "../stores/useGoogleAuthStore"; // ✅ 追加
import { getRandomRecharge } from "../utils/randomRecharge";
import { findRechargeGaps } from "../utils/findRechargeGap";
import googleApi from "../lib/googleApi";

import type { CalendarEvent } from "../types/calendar";
import type { RechargeSlot } from "../types/recharge";

const DEFAULT_INTENSITY = 3;

const Home: React.FC = () => {
  const addRecharge = useRechargesStore((s) => s.addRecharge);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const fetchedRef = useRef(false);

  const { sleepHours, maxEvents, totalDuration, balanceScore, balanceStatus } =
    useProgressStore();

  const { accessToken, setAuth } = useGoogleAuthStore();

  // ✅ サイレントログイン（Googleセッションから自動認証）
  const silentLogin = useGoogleLogin({
    ...({
      flow: "auth-code",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prompt: "none",
      scope:
        "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    } as any),
    onSuccess: async (codeResponse: any) => {
      // ...
    },
  });

  // ✅ Google Calendar Events取得
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCalendarEvents = async (token?: string) => {
      try {
        let fetched: CalendarEvent[] = [];

        if (token) {
          console.log("📅 Google Calendar API から予定取得");
          const res = await axios.get(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                maxResults: 10,
                orderBy: "startTime",
                singleEvents: true,
                timeMin: new Date().toISOString(),
              },
            }
          );

          fetched = res.data.items.map((ev: any) => ({
            id: ev.id,
            summary: ev.summary || "（タイトルなし）",
            start: ev.start.dateTime || ev.start.date,
            end: ev.end.dateTime || ev.end.date,
            intensity: DEFAULT_INTENSITY,
          }));
        } else {
          console.log("⚙️ ローカルAPIで予定取得");
          await googleApi.initGoogleApi();
          fetched = await googleApi.listUpcomingEvents();
        }

        // 重複排除
        const seen = new Map<string, CalendarEvent>();
        for (const ev of fetched) {
          const key =
            (ev as any).iCalUID ||
            `${ev.summary}-${new Date(ev.start).getHours()}-${new Date(
              ev.end
            ).getHours()}`;
          if (!seen.has(key)) seen.set(key, ev);
        }

        setEvents(Array.from(seen.values()));
      } catch (err: any) {
        console.error("⚠️ カレンダー取得エラー:", err.response?.data || err);
        if (err.response?.status === 401) {
          console.log("🔁 Token期限切れ → silent login 再試行");
          silentLogin();
        }
      }
    };

    // 初回呼び出し
    if (accessToken) {
      fetchCalendarEvents(accessToken);
    } else {
      silentLogin(); // tokenがなければ自動再ログイン
    }
  }, [accessToken]);

  // ---- 日付操作 ----
  const prevDay = () => setCurrentDate((d) => addDays(d, -1));
  const nextDay = () => setCurrentDate((d) => addDays(d, 1));

  // ---- リチャージ追加 ----
  const handleAddRecharge = () => {
    const durationMin = 30;
    const gaps = findRechargeGaps(events, durationMin);

    if (gaps.length === 0) {
      alert("リチャージを挿入できる時間帯が見つかりませんでした");
      return;
    }

    const randomGap = gaps[Math.floor(Math.random() * gaps.length)];
    const start = new Date(randomGap.start);
    const end = new Date(start.getTime() + durationMin * 60000);

    const startTimeStr = start.toTimeString().slice(0, 5);
    const endTimeStr = end.toTimeString().slice(0, 5);

    const newRecharge = getRandomRecharge();

    const rechargeEvent: RechargeSlot = {
      id: nanoid(),
      start: start.toISOString(),
      end: end.toISOString(),
      time: `${startTimeStr} - ${endTimeStr}`,
      category: newRecharge.category,
      title: newRecharge.title,
      actions: [],
      intensity: DEFAULT_INTENSITY,
    };

    addRecharge(rechargeEvent);
  };

  // ---- レンダリング ----
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2b7db3] via-[#3aa1d9] to-[#69c2ec] text-slate-900 flex flex-col pb-24">
      {/* 上部ナビ */}
      <div className="pt-4">
        <HeaderDateNav
          date={currentDate}
          onPrev={prevDay}
          onNext={nextDay}
          className="mx-auto max-w-[480px]"
        />
      </div>

      <main className="flex-1 mx-auto w-full max-w-[480px] px-4 mt-2 space-y-6">
        {/* コンディション */}
        <section>
          <h2 className="text-white/95 text-lg font-semibold mb-2">
            今日のコンディション
          </h2>
          <TodayConditionCard
            title="バランス指数"
            events={events}
            balanceScore={balanceScore}
            status={balanceStatus}
            sleepHours={sleepHours}
            maxEvents={maxEvents}
            totalDuration={totalDuration}
          />
        </section>

        {/* CTA */}
        <section>
          <PrimaryCTA
            label="リチャージを予定に入れる"
            onClick={handleAddRecharge}
          />
        </section>

        {/* 今日の予定 */}
        <section className="mb-8">
          <h2 className="text-white/95 text-lg font-semibold mb-2">
            今日の予定
          </h2>
          <div className="rounded-2xl bg-white/15 p-4 text-white/90 ring-1 ring-white/20">
            <GoogleCalendar events={events} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
