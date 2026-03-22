// src/pages/CalendarPage.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  addMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
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

// イベントのソースに応じた色
const eventColor = (source?: string) => {
  if (source === "google") return "border-l-4 border-yellow-400 bg-yellow-50";
  if (source === "user") return "border-l-4 border-teal-400 bg-teal-50";
  return "border-l-4 border-pink-400 bg-pink-50";
};

const dotColor = (source?: string) => {
  if (source === "google") return "bg-yellow-300";
  if (source === "user") return "bg-teal-400";
  return "bg-pink-300";
};

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const { slots } = useRechargesStore();
  const { accessToken } = useGoogleAuthStore();

  // Firestore リチャージ取得
  useEffect(() => {
    const q = query(collection(db, "recharges"), where("published", "==", true));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: CalendarEvent[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          start: d.start ?? new Date().toISOString(),
          end: d.end ?? new Date().toISOString(),
          isRecharge: true,
          source: "firestore",
        };
      });
      setEvents((prev) => [...prev.filter((e) => e.source !== "firestore"), ...list]);
    });
    return () => unsub();
  }, []);

  // Google カレンダー取得
  useEffect(() => {
    if (!accessToken) return;
    const fetchGoogle = async () => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              maxResults: 100,
              singleEvents: true,
              orderBy: "startTime",
              timeMin: startOfMonth(currentDate).toISOString(),
              timeMax: endOfMonth(currentDate).toISOString(),
            },
          }
        );
        const list: CalendarEvent[] = res.data.items.map((e: any) => ({
          id: e.id,
          title: e.summary || "（タイトルなし）",
          start: e.start.dateTime || e.start.date,
          end: e.end.dateTime || e.end.date,
          source: "google",
        }));
        setEvents((prev) => [...prev.filter((e) => e.source !== "google"), ...list]);
      } catch (err) {
        console.error("Googleカレンダー取得エラー:", err);
      }
    };
    fetchGoogle();
  }, [accessToken, currentDate]);

  // ユーザーリチャージスロット
  useEffect(() => {
    const list: CalendarEvent[] = slots.map((r) => ({
      id: r.id,
      title: r.label ?? r.category,
      start: r.start,
      end: r.end,
      isRecharge: true,
      source: "user",
    }));
    setEvents((prev) => [...prev.filter((e) => e.source !== "user"), ...list]);
  }, [slots]);

  const eventsForDay = (date: Date) =>
    events
      .filter((e) => isSameDay(new Date(e.start), date))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // 月の42マス
  const monthDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ja });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  };

  // 週の7日
  const weekDays = () => {
    const start = startOfWeek(currentDate, { locale: ja });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // 時間軸（5〜23時）
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  // ナビゲーション
  const navigate = (dir: 1 | -1) => {
    if (view === "month") setCurrentDate((d) => addMonths(d, dir));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, dir));
    else setCurrentDate((d) => addDays(d, dir));
  };

  // ヘッダータイトル
  const headerTitle = () => {
    if (view === "month") return format(currentDate, "yyyy年 M月", { locale: ja });
    if (view === "week") {
      const start = startOfWeek(currentDate, { locale: ja });
      const end = addDays(start, 6);
      return `${format(start, "M月d日", { locale: ja })} 〜 ${format(end, "M月d日", { locale: ja })}`;
    }
    return format(currentDate, "M月d日（E）", { locale: ja });
  };

  // 範囲外クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setSelectedDate(null);
      }
    };
    if (selectedDate) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedDate]);

  const fade = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4AA9D9] to-[#E3F4FB] text-slate-800 flex flex-col pb-20 relative overflow-hidden">
      {/* ヘッダー */}
      <header className="flex justify-between items-center px-4 pt-4 pb-2 text-white">
        <button onClick={() => navigate(-1)} className="text-white/90 text-xl px-2 py-1">←</button>
        <h1 className="text-[16px] font-semibold">{headerTitle()}</h1>
        <button onClick={() => navigate(1)} className="text-white/90 text-xl px-2 py-1">→</button>
      </header>

      {/* 表示切替 */}
      <div className="flex justify-center gap-2 mb-3 px-4">
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

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ===== 月表示 ===== */}
          {view === "month" && (
            <motion.div key="month" {...fade}>
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 mb-1">
                {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                  <div key={d} className="text-center text-[11px] text-white/70 font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays().map((day) => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const dayEvents = eventsForDay(day);
                  const inMonth = day.getMonth() === currentDate.getMonth();
                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(isSelected ? null : new Date(day))}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${
                        isSelected
                          ? "bg-white text-[#2b7db3] shadow-md"
                          : isToday(day)
                          ? "bg-white/50 text-white ring-2 ring-white"
                          : inMonth
                          ? "bg-white/25 text-white"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      <span className="text-[13px] font-semibold">{format(day, "d")}</span>
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${dotColor(e.source)}`} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===== 週表示 ===== */}
          {view === "week" && (
            <motion.div key="week" {...fade} className="space-y-2">
              {weekDays().map((day) => {
                const dayEvents = eventsForDay(day);
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-2xl overflow-hidden ${
                      today ? "ring-2 ring-white" : ""
                    }`}
                  >
                    {/* 日付ヘッダー */}
                    <div
                      className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                        today ? "bg-white/60" : "bg-white/30"
                      }`}
                      onClick={() => {
                        setSelectedDate(day);
                        setView("day");
                        setCurrentDate(day);
                      }}
                    >
                      <span className={`text-[13px] font-bold ${today ? "text-[#2b7db3]" : "text-white"}`}>
                        {format(day, "M/d（E）", { locale: ja })}
                      </span>
                      {today && (
                        <span className="text-[10px] bg-[#2b7db3] text-white px-1.5 py-0.5 rounded-full font-medium">
                          今日
                        </span>
                      )}
                      <div className="flex gap-1 ml-auto">
                        {dayEvents.slice(0, 4).map((e) => (
                          <span key={e.id} className={`w-2 h-2 rounded-full ${dotColor(e.source)}`} />
                        ))}
                      </div>
                    </div>

                    {/* イベント一覧 */}
                    {dayEvents.length > 0 && (
                      <div className="bg-white/20 px-3 py-1.5 space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div key={e.id} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(e.source)}`} />
                            <span className="text-[12px] text-white truncate">{e.title}</span>
                            <span className="text-[11px] text-white/70 ml-auto flex-shrink-0">
                              {format(new Date(e.start), "HH:mm")}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[11px] text-white/60 text-right">
                            +{dayEvents.length - 3}件
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ===== 日表示 ===== */}
          {view === "day" && (
            <motion.div key="day" {...fade} className="overflow-y-auto max-h-[calc(100vh-180px)]">
              {/* 今日バッジ */}
              {isToday(currentDate) && (
                <div className="flex justify-center mb-3">
                  <span className="bg-white/40 text-white text-[12px] font-medium px-3 py-1 rounded-full">
                    今日
                  </span>
                </div>
              )}

              {/* タイムライン */}
              <div className="relative">
                {hours.map((hour) => {
                  const hourEvents = eventsForDay(currentDate).filter((e) => {
                    const h = new Date(e.start).getHours();
                    return h === hour;
                  });
                  return (
                    <div key={hour} className="flex gap-3 min-h-[56px]">
                      {/* 時刻ラベル */}
                      <div className="w-12 text-right flex-shrink-0 pt-1">
                        <span className="text-[12px] text-white/70 font-medium">
                          {hour}:00
                        </span>
                      </div>

                      {/* 区切り線 + イベント */}
                      <div className="flex-1 border-t border-white/20 pt-1 pb-1 space-y-1">
                        {hourEvents.length === 0 ? null : (
                          hourEvents.map((e) => (
                            <div
                              key={e.id}
                              className={`rounded-lg px-3 py-1.5 bg-white shadow-sm ${eventColor(e.source)}`}
                            >
                              <p className="text-[13px] font-semibold text-slate-800 truncate">{e.title}</p>
                              <p className="text-[11px] text-slate-500">
                                {format(new Date(e.start), "HH:mm")}
                                {" – "}
                                {format(new Date(e.end), "HH:mm")}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 予定なし */}
                {eventsForDay(currentDate).length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white/50 text-[14px]">この日の予定はありません</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 月表示の日付タップ → 下部スライドパネル */}
      <AnimatePresence>
        {selectedDate && view === "month" && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div
              ref={sheetRef}
              key="day-detail"
              initial={{ opacity: 0, y: 300 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 300 }}
              transition={{ type: "spring", stiffness: 180, damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl rounded-t-[28px] shadow-2xl p-4 max-h-[60vh] overflow-y-auto z-20"
            >
              <div className="flex justify-center mb-3">
                <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[16px] font-semibold text-[#2b7db3]">
                  {format(selectedDate, "M月d日（E）", { locale: ja })}
                </h3>
                <button
                  onClick={() => {
                    setView("day");
                    setCurrentDate(selectedDate);
                    setSelectedDate(null);
                  }}
                  className="text-[12px] text-sky-500 font-medium"
                >
                  日表示で見る →
                </button>
              </div>

              {eventsForDay(selectedDate).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">予定はありません</p>
              ) : (
                eventsForDay(selectedDate).map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-3 mb-2 ${eventColor(e.source)}`}
                  >
                    <p className="text-[14px] font-semibold text-slate-800">{e.title}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {format(new Date(e.start), "HH:mm")} – {format(new Date(e.end), "HH:mm")}
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
