import React, { useState, useEffect, useRef, useMemo } from "react";
import { addDays } from "date-fns";
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
import googleApi from "../lib/googleApi";

import type { CalendarEvent } from "../types/calendar";

const DEFAULT_INTENSITY = 3;

const Home: React.FC = () => {
  // ストアからロジックとアクションを取得
  const fetchData = useRechargesStore((s) => s.fetchData);
  const addSlot = useRechargesStore((s) => s.addSlot);
  const getFilteredRecharges = useRechargesStore((s) => s.getFilteredRecharges);
  const getActiveRule = useRechargesStore((s) => s.getActiveRule);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const fetchedRef = useRef(false);

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

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCalendarEvents = async (token?: string) => {
      try {
        let fetched: CalendarEvent[] = [];
        if (token) {
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
          await googleApi.initGoogleApi();
          fetched = await googleApi.listUpcomingEvents();
        }
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
        if (err.response?.status === 401) {
          silentLogin();
        }
      }
    };

    if (accessToken) {
      fetchCalendarEvents(accessToken);
    } else {
      silentLogin();
    }
  }, [accessToken, silentLogin]);

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

    const candidates = getFilteredRecharges();
    const activeRule = getActiveRule();

    // ✅ ここからが修正箇所です
    let categoryToAdd: string | null = null;

    if (candidates.length > 0) {
      // 1. 候補の中からユニークなカテゴリをリストアップ
      const availableCategories = Array.from(
        new Set(candidates.map((c) => c.category!))
      );
      // 2. そのリストからランダムに1つ選ぶ
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
      // 1. フォールバックとして、ルールで許可されたカテゴリをリストアップ
      const availableCategories = activeRule.categories;
      // 2. そのリストからランダムに1つ選ぶ
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
            events={events}
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
            <GoogleCalendar events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
