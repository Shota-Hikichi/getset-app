// src/pages/Home.tsx
import React, { useState, useEffect, useCallback } from "react";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

import HeaderDateNav from "../components/HeaderDateNav";
import TodayConditionCard from "../components/TodayConditionCard";
import GoogleCalendar from "../components/GoogleCalendar";
import Footer from "../components/Footer";

import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
import { useGoogleAuthStore } from "../stores/useGoogleAuthStore";
import { findRechargeGaps } from "../utils/findRechargeGap";

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

  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const { sleepHours, maxEvents, totalDuration, balanceScore, balanceStatus } =
    useProgressStore();

  const { accessToken, setAuth } = useGoogleAuthStore();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    accessType: "offline",
    prompt: "consent",
    onSuccess: async (codeResponse: CodeResponse) => {
      setReconnecting(true);
      try {
        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            code: codeResponse.code,
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.VITE_SECRET_KEY,
            redirect_uri: window.location.origin,
            grant_type: "authorization_code",
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        const { access_token, refresh_token } = tokenRes.data;
        const userRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        setAuth(access_token, userRes.data, refresh_token);
        const user = auth.currentUser;
        if (user && refresh_token) {
          await setDoc(
            doc(db, "userProfiles", user.uid),
            { googleRefreshToken: refresh_token },
            { merge: true }
          );
        }
        setCalendarError(null);
      } catch (err) {
        console.error("Google再連携エラー:", err);
        setCalendarError("network");
      } finally {
        setReconnecting(false);
      }
    },
    onError: () => {
      setCalendarError("network");
    },
  } as any);

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("ストアのデータ取得に失敗:", err);
    });
  }, [fetchData]);

  const loadEvents = useCallback(async () => {
    setCalendarLoading(true);
    setCalendarError(null);
    try {
      const token = accessToken;

      if (!token) {
        setCalendarError("auth");
        return;
      }

      const fetched = await fetchCalendarEvents(token, currentDate);
      setEvents(fetched);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setCalendarError("auth");
      } else {
        setCalendarError("network");
        console.error("カレンダー取得エラー:", err);
      }
    } finally {
      setCalendarLoading(false);
    }
  }, [accessToken, currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
    <div className="relative min-h-screen bg-gradient-to-b from-[#B8D9EE] via-[#D5EBF7] to-[#EDF6FB] text-slate-900 flex flex-col pb-24">
      <div className="pt-4">
        <HeaderDateNav
          date={currentDate}
          onPrev={prevDay}
          onNext={nextDay}
          className="mx-auto max-w-[480px]"
        />
      </div>
      <main className="flex-1 mx-auto w-full max-w-[480px] px-4 mt-4 space-y-5">
        <section>
          <h2 className="text-[15px] font-semibold text-slate-700 mb-2">
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
          <button
            onClick={handleAddRecharge}
            className="w-full flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-sm text-[15px] font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-transform"
          >
            <span>リチャージを予定に入れる</span>
            <span className="text-slate-400 text-lg">→</span>
          </button>
        </section>
        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-slate-700">
              今日の予定
            </h2>
            <button
              onClick={loadEvents}
              disabled={calendarLoading}
              className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700 active:scale-95 transition-all disabled:opacity-40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={calendarLoading ? "animate-spin" : ""}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              再同期
            </button>
          </div>
          {calendarLoading ? (
            <div className="text-center text-slate-400 text-[13px] py-6">
              予定を読み込み中...
            </div>
          ) : calendarError === "auth" ? (
            <div className="bg-white rounded-2xl px-5 py-6 text-center shadow-sm">
              <p className="text-[13px] text-slate-500 mb-1">
                Googleカレンダーと連携できませんでした
              </p>
              <p className="text-[12px] text-slate-400 mb-4">
                アクセストークンが期限切れの可能性があります
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => googleLogin()}
                  disabled={reconnecting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  <img
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  {reconnecting ? "連携中..." : "Googleアカウントで再連携する"}
                </button>
                <button
                  onClick={loadEvents}
                  className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-200 transition-colors"
                >
                  再試行
                </button>
              </div>
            </div>
          ) : calendarError === "network" ? (
            <div className="bg-white rounded-2xl px-5 py-5 text-center shadow-sm">
              <p className="text-[13px] text-slate-500 mb-3">
                カレンダーの読み込みに失敗しました
              </p>
              <button
                onClick={loadEvents}
                className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-200 transition-colors"
              >
                再試行
              </button>
            </div>
          ) : (
            <GoogleCalendar events={events} currentDate={currentDate} />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
