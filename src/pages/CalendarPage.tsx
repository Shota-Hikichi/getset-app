// src/pages/CalendarPage.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { useRechargesStore } from "../stores/useRechargesStore";
import { useGoogleAuthStore } from "../stores/useGoogleAuthStore";
import { db } from "../lib/firebase";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isRecharge?: boolean;
  source?: "google" | "firestore" | "user";
}

type ViewMode = "month" | "week" | "day";

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const sheetRef = useRef<HTMLDivElement | null>(null); // ✅ 下部パネル参照

  const { slots } = useRechargesStore();
  const { accessToken } = useGoogleAuthStore();

  // ✅ Firestore（publishedリチャージ）リアルタイム取得
  useEffect(() => {
    const q = query(
      collection(db, "recharges"),
      where("published", "==", true)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreRecharges: CalendarEvent[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title, // Firestore の 'recharges' コレクションには 'title' があると想定
          start: d.start ?? new Date().toISOString(),
          end: d.end ?? new Date().toISOString(),
          isRecharge: true,
          source: "firestore",
        };
      });
      setEvents((prev) => [
        ...prev.filter((e) => e.source !== "firestore"),
        ...firestoreRecharges,
      ]);
    });
    return () => unsub();
  }, []);

  // ✅ Google カレンダーイベント取得
  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (!accessToken) return;
      try {
        const res = await axios.get(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              maxResults: 50,
              singleEvents: true,
              orderBy: "startTime",
              timeMin: startOfMonth(currentDate).toISOString(),
              timeMax: endOfMonth(currentDate).toISOString(),
            },
          }
        );

        const googleEvents: CalendarEvent[] = res.data.items.map((e: any) => ({
          id: e.id,
          title: e.summary || "（タイトルなし）",
          start: e.start.dateTime || e.start.date,
          end: e.end.dateTime || e.end.date,
          source: "google",
        }));

        setEvents((prev) => [
          ...prev.filter((e) => e.source !== "google"),
          ...googleEvents,
        ]);
      } catch (err) {
        console.error("⚠️ Googleカレンダー取得エラー:", err);
      }
    };
    fetchGoogleEvents();
  }, [accessToken, currentDate]);

  // ✅ ローカルストア（ユーザー追加リチャージ）
  useEffect(() => {
    const userRecharges: CalendarEvent[] = slots.map((r) => ({
      id: r.id,
      // --- 👇 修正箇所 ---
      // 'RechargeSlot' 型の 'title' を 'label' に修正
      // 'label' がなければフォールバックとして 'category' を使用
      title: r.label ?? r.category,
      // --- 👆 修正ここまで ---
      start: r.start,
      end: r.end,
      isRecharge: true,
      source: "user",
    }));

    setEvents((prev) => [
      ...prev.filter((e) => e.source !== "user"),
      ...userRecharges,
    ]);
  }, [slots]); // 依存配列に slots が必要

  // 📆 月の42マス生成
  const monthDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ja });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  };

  // 🔍 指定日の予定取得
  const eventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.start), date));

  // 💫 範囲外クリックで閉じるイベント
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(event.target as Node)
      ) {
        setSelectedDate(null);
      }
    }

    if (selectedDate) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedDate]);

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4AA9D9] to-[#E3F4FB] text-slate-800 flex flex-col pb-20 relative overflow-hidden">
      {/* ヘッダー */}
      <header className="flex justify-between items-center p-4 text-white">
        <button onClick={() => setCurrentDate((d) => addDays(d, -30))}>
          ←
        </button>
        <h1 className="text-lg font-semibold">
          {format(currentDate, "yyyy年 M月", { locale: ja })}
        </h1>
        <button onClick={() => setCurrentDate((d) => addDays(d, 30))}>→</button>
      </header>

      {/* 表示切替ボタン */}
      <div className="flex justify-center gap-3 mb-3">
        {(["month", "week", "day"] as ViewMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setView(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              view === m
                ? "bg-white text-[#2b7db3] shadow"
                : "bg-white/30 text-white/90 hover:bg-white/40"
            }`}
          >
            {m === "month" ? "月表示" : m === "week" ? "週表示" : "日表示"}
          </button>
        ))}
      </div>

      {/* 月表示 */}
      <main className="flex-1 px-4">
        <AnimatePresence mode="wait">
          {view === "month" && (
            <motion.div
              key="month"
              {...fade}
              className="grid grid-cols-7 gap-2"
            >
              {monthDays().map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayEvents = eventsForDay(day);
                return (
                  <motion.div
                    key={day.toISOString()}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setSelectedDate(isSelected ? null : new Date(day))
                    }
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer border transition ${
                      isSelected
                        ? "bg-white text-[#2b7db3] border-[#2b7db3]"
                        : "bg-white/30 text-white border-transparent"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {format(day, "d")}
                    </span>
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={`w-2 h-2 rounded-full ${
                            e.source === "google"
                              ? "bg-yellow-300"
                              : e.source === "user"
                              ? "bg-teal-400"
                              : "bg-pink-300"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ✅ 下半分スライドで当日の予定を表示（範囲外タップで閉じる） */}
      <AnimatePresence>
        {selectedDate && (
          <>
            {/* 背景クリック用のオーバーレイ */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
            />

            {/* 下部パネル */}
            <motion.div
              ref={sheetRef}
              key="day-detail"
              initial={{ opacity: 0, y: 300 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 300 }}
              transition={{ type: "spring", stiffness: 180, damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto z-20"
            >
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#2b7db3] text-center">
                {format(selectedDate, "M月d日（E）", { locale: ja })}
              </h3>

              {eventsForDay(selectedDate).length === 0 ? (
                <p className="text-slate-500 text-sm text-center">
                  予定はありません。
                </p>
              ) : (
                eventsForDay(selectedDate).map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-2xl p-3 mb-2 ${
                      e.source === "google"
                        ? "bg-yellow-100 border border-yellow-300"
                        : e.source === "user"
                        ? "bg-teal-100 border border-teal-300"
                        : "bg-pink-100 border border-pink-300"
                    }`}
                  >
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-slate-600">
                      {format(new Date(e.start), "HH:mm")} -{" "}
                      {format(new Date(e.end), "HH:mm")}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
