// src/components/GoogleCalendar.tsx
import React, { useState, useEffect, useMemo } from "react";
import { isSameDay } from "date-fns";
import type { CalendarEvent } from "../types/calendar";
import type { RechargeAction } from "../types/recharge";
import type { RechargeRule } from "../types/rechargeRule";
import CalendarEventCard from "./CalendarEventCard";
import RechargeDetailCard from "./RechargeDetailCard";
import { useRechargesStore, RechargeSlot } from "../stores/useRechargesStore";
import { formatTime } from "../utils/formatTime";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  events: CalendarEvent[];
  currentDate: Date;
}

interface CombinedItem extends CalendarEvent {
  isRecharge: boolean;
  slotTime?: string;
  slotCategory?: string;
}

// (ヘルパー関数は変更なし)
function getDayType(date: Date): "workday" | "holiday" {
  const day = date.getDay();
  return day === 0 || day === 6 ? "holiday" : "workday";
}
function getCurrentTimeZone(): "morning" | "during" | "after" {
  const hour = new Date().getHours();
  if (hour < 9) return "morning";
  if (hour >= 9 && hour < 18) return "during";
  return "after";
}

export default function GoogleCalendar({ events, currentDate }: Props) {
  const [selectedIntensity, setSelectedIntensity] = useState<
    Record<string, number>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedAction, setPickedAction] = useState<
    Record<string, RechargeAction>
  >({});

  const removeRecharge = useRechargesStore((s) => s.removeRecharge);
  const timeZone = useRechargesStore((s) => s.timeZone);
  const setTimeZone = useRechargesStore((s) => s.setTimeZone);
  const allRecharges = useRechargesStore((s) => s.allRecharges);
  const rechargeRules = useRechargesStore((s) => s.rechargeRules);
  const rechargeSlots = useRechargesStore((s) => s.slots);

  /**
   * 1分ごとに時間帯をチェックして、ストアのtimeZoneを更新
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimeZone = getCurrentTimeZone();
      if (newTimeZone !== timeZone) {
        setTimeZone(newTimeZone);
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [timeZone, setTimeZone]);

  // (useMemo フック群は変更なし)
  const activeRule = useMemo<RechargeRule | null>(() => {
    if (rechargeRules.length === 0) return null;
    const now = new Date();
    const currentDayType = getDayType(now);
    const matchingRules = rechargeRules.filter(
      (rule) => rule.dayType === currentDayType && rule.timeZone === timeZone
    );
    if (matchingRules.length === 0) return null;
    return matchingRules.sort((a, b) => b.priority - a.priority)[0];
  }, [rechargeRules, timeZone]);

  // ===== 👇 ここから修正 👇 =====
  const filteredAndSortedRecharges = useMemo(() => {
    if (!activeRule || allRecharges.length === 0) return [];

    let candidates = allRecharges.filter((recharge) => {
      // [修正] エラー(duration: number)に基づき、parseInt を削除
      const duration = (recharge as any).duration || 0; // (as any で一時的に型エラーを回避)
      const recovery = recharge.recovery;

      const categoryMatch =
        !activeRule.categories ||
        activeRule.categories.length === 0 ||
        (recharge.category &&
          activeRule.categories.includes(recharge.category.trim()));

      const durationMatch =
        duration >= (activeRule.minDuration ?? 0) &&
        duration <= (activeRule.maxDuration ?? Infinity);

      const recoveryMatch =
        recovery >= (activeRule.minRecovery ?? 0) &&
        recovery <= (activeRule.maxRecovery ?? Infinity);

      return categoryMatch && durationMatch && recoveryMatch;
    });

    if (activeRule.sortBy && activeRule.sortOrder) {
      candidates.sort((a, b) => {
        const key = activeRule.sortBy!;
        const order = activeRule.sortOrder === "asc" ? 1 : -1;

        // [修正] エラー(duration: number)に基づき、parseInt を削除
        const valA = key === "duration" ? (a as any).duration : a.recovery;
        const valB = key === "duration" ? (b as any).duration : b.recovery;

        // (duration が string の場合に備えた安全策)
        // const valA = key === "duration" ? Number(a.duration) || 0 : a.recovery;
        // const valB = key === "duration" ? Number(b.duration) || 0 : b.recovery;

        return (valA - valB) * order;
      });
    }
    return candidates;
  }, [allRecharges, activeRule]);
  // ===== 👆 ここまで修正 👆 =====

  const validRechargeSlots = useMemo(() => {
    return rechargeSlots.filter((slot) =>
      isSameDay(new Date(slot.start), currentDate)
    );
  }, [rechargeSlots, currentDate]);

  /**
   * イベントと「有効なリチャージスロット」を結合して表示用データを作成
   */
  const [combined, setCombined] = useState<CombinedItem[]>([]);
  useEffect(() => {
    const items: CombinedItem[] = events
      .filter((e) => isSameDay(new Date(e.start), currentDate))
      .map((e) => ({
        ...e,
        isRecharge: false,
      }));

    validRechargeSlots.forEach((r: RechargeSlot) => {
      const startDate = new Date(r.start);
      const endDate = new Date(r.end);
      items.push({
        id: r.id,
        summary: r.label ?? r.category,
        start: r.start,
        end: r.end,
        intensity: selectedIntensity[r.id] ?? 0,
        isRecharge: true,
        slotTime: formatTimeRange(startDate, endDate),
        slotCategory: r.category,
      });
    });

    // 結合したリストをソート
    items.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    setCombined(items);
  }, [
    events,
    validRechargeSlots,
    selectedIntensity,
    pickedAction,
    currentDate,
  ]);

  /**
   * 強度変更のハンドラ
   */
  function handleIntensityChange(id: string, lvl: number) {
    setSelectedIntensity((p) => ({ ...p, [id]: lvl }));
  }

  // ========================== JSX ==========================
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {combined.map((item) =>
          item.isRecharge ? (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {expandedId === item.id ? (
                  <motion.div
                    key="expanded"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    <RechargeDetailCard
                      // [修正] duration が number かもしれないので string に変換
                      title={pickedAction[item.id]?.label ?? item.slotCategory!}
                      time={
                        pickedAction[item.id]?.duration?.toString() ??
                        item.slotTime!
                      }
                      actions={filteredAndSortedRecharges.filter(
                        (a) => a.category === item.slotCategory
                      )}
                      onSelect={(action) => {
                        setPickedAction((p) => ({ ...p, [item.id]: action }));
                        setExpandedId(null);
                      }}
                      isRecharge
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setExpandedId(item.id)}
                  >
                    <CalendarEventCard
                      id={item.id}
                      title={pickedAction[item.id]?.label ?? item.summary}
                      start={formatTime(item.start)}
                      end={formatTime(item.end)}
                      intensity={selectedIntensity[item.id] ?? 0}
                      onChange={(lvl) => handleIntensityChange(item.id, lvl)}
                      isRecharge
                      onDelete={() => removeRecharge(item.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            // 通常イベント
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CalendarEventCard
                id={item.id}
                title={item.summary}
                start={item.start} // CalendarEventCard 側で formatTime する
                end={item.end} // CalendarEventCard 側で formatTime する
                intensity={selectedIntensity[item.id] ?? item.intensity}
                onChange={(lvl) => handleIntensityChange(item.id, lvl)}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 時間フォーマット整形
 */
function formatTimeRange(startDate: Date, endDate: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
  const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
  return `${start} - ${end}`;
}
