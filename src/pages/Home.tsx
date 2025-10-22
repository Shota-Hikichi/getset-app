// src/pages/Home.tsx
import React, { useState, useEffect, useMemo } from "react";
import { addDays, startOfDay, endOfDay } from "date-fns";
// import axios from "axios"; // calendarServiceで使うので不要
// import { useGoogleLogin } from "@react-oauth/google"; // AuthWrapperに移動

import HeaderDateNav from "../components/HeaderDateNav";
import TodayConditionCard from "../components/TodayConditionCard";
import PrimaryCTA from "../components/PrimaryCTA";
import GoogleCalendar from "../components/GoogleCalendar";
// import Footer from "../components/Footer"; // App.tsxで制御

import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
// import { useGoogleAuthStore } from "../stores/useGoogleAuthStore"; // AuthWrapperで使用
import { useCalendarStore } from "../stores/useCalendarStore"; // カレンダーイベントストア
import { findRechargeGaps } from "../utils/findRechargeGap";
// import { fetchGoogleCalendarEvents } from "../services/calendarService"; // 日付変更時に使うなら必要

import type { CalendarEvent } from "../types/calendar";

const Home: React.FC = () => {
  // --- Zustand ストアからの取得 ---
  const fetchData = useRechargesStore((s) => s.fetchData);
  const addSlot = useRechargesStore((s) => s.addSlot);
  const getFilteredRecharges = useRechargesStore((s) => s.getFilteredRecharges);
  const getActiveRule = useRechargesStore((s) => s.getActiveRule);
  const { sleepHours, maxEvents, totalDuration, balanceScore, balanceStatus } =
    useProgressStore();

  // --- 👇 修正: Zustandストアから状態を個別に選択 ---
  const events = useCalendarStore((state) => state.events);
  const isLoading = useCalendarStore((state) => state.isLoading);
  const error = useCalendarStore((state) => state.error);
  // --- 👆 修正ここまで ---

  // --- ローカルステート ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- 初回のリチャージルール/アクションデータ取得 ---
  useEffect(() => {
    fetchData().catch((err) => {
      console.error("ストアのデータ取得に失敗:", err);
    });
  }, [fetchData]);

  // --- 📅 日付変更処理 ---
  const prevDay = () => setCurrentDate((d) => addDays(d, -1));
  const nextDay = () => setCurrentDate((d) => addDays(d, 1));

  // --- 🔄 日付変更時にカレンダーイベントを再取得する処理 (任意 - 必要ならコメント解除) ---
  // useEffect(() => {
  //   const loadEventsForDate = async () => {
  //     const token = useGoogleAuthStore.getState().accessToken;
  //     if (token) {
  //       useCalendarStore.getState().setLoading(true);
  //       try {
  //         const start = startOfDay(currentDate).toISOString();
  //         const end = endOfDay(currentDate).toISOString();
  //         const fetchedEvents = await fetchGoogleCalendarEvents(token, start, end);
  //         useCalendarStore.getState().setEvents(fetchedEvents);
  //       } catch (err) {
  //         console.error("日付変更時のカレンダー取得エラー:", err);
  //         useCalendarStore.getState().setError("イベントの取得に失敗しました。");
  //       }
  //     }
  //   };
  //   loadEventsForDate();
  // }, [currentDate]);

  // ---- リチャージ追加 (変更なし) ----
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
    let categoryToAdd: string | null = null;

    if (candidates.length > 0) {
      const availableCategories = Array.from(
        new Set(candidates.map((c) => c.category!).filter(Boolean))
      );
      if (availableCategories.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * availableCategories.length
        );
        categoryToAdd = availableCategories[randomIndex];
        console.log(
          `✅ 候補カテゴリ [${availableCategories.join(", ")}] から選択:`,
          categoryToAdd
        );
      } else {
        console.log("⚠️ 候補リチャージに有効なカテゴリがありません。");
      }
    }

    if (!categoryToAdd && activeRule?.categories?.length) {
      const availableCategories = activeRule.categories;
      const randomIndex = Math.floor(
        Math.random() * availableCategories.length
      );
      categoryToAdd = availableCategories[randomIndex];
      console.log(
        `⚠️ フォールバックカテゴリ [${availableCategories.join(
          ", "
        )}] から選択:`,
        categoryToAdd
      );
    }

    if (categoryToAdd) {
      addSlot({
        start: start.toISOString(),
        end: end.toISOString(),
        category: categoryToAdd,
        label: categoryToAdd,
      });
    } else {
      alert(
        "現在提案できるリチャージカテゴリが見つかりません。管理画面でルールやリチャージを確認してください。"
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
            events={events} // ストアから取得したイベント
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
            {/* ローディングとエラー表示 */}
            {isLoading && (
              <p className="text-center text-white/80">
                カレンダーを読み込み中...
              </p>
            )}
            {error && <p className="text-center text-red-300">{error}</p>}
            {
              !isLoading && !error && (
                <GoogleCalendar events={events} />
              ) /* ストアから取得したイベント */
            }
          </div>
        </section>
      </main>
      {/* FooterはApp.tsxで制御 */}
    </div>
  );
};

export default Home;
