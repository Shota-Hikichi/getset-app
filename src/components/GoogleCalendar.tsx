// src/components/GoogleCalendar.tsx
import React, { useEffect, useState } from "react";
import type { CalendarEvent } from "../types/calendar";
import type { RechargeAction } from "../types/recharge";
import CalendarEventCard from "./CalendarEventCard";
import RechargeDetailCard from "./RechargeDetailCard";
import { useRechargesStore } from "../stores/useRechargesStore";
import { formatTime } from "../utils/formatTime";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  events: CalendarEvent[];
}

interface CombinedItem extends CalendarEvent {
  isRecharge: boolean;
  slotTime?: string;
  slotCategory?: string;
}

/**
 * 🔹 時間帯を自動で判定する関数
 */
function getCurrentTimeZone(): "morning" | "during" | "after" {
  const hour = new Date().getHours();
  if (hour < 9) return "morning";
  if (hour >= 9 && hour < 18) return "during";
  return "after";
}

export default function GoogleCalendar({ events }: Props) {
  const [selectedIntensity, setSelectedIntensity] = useState<
    Record<string, number>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedAction, setPickedAction] = useState<
    Record<string, RechargeAction>
  >({});
  const [allRecharges, setAllRecharges] = useState<RechargeAction[]>([]);
  const [timeZone, setTimeZone] = useState<"morning" | "during" | "after">(
    getCurrentTimeZone()
  );

  const rechargeSlots = useRechargesStore((s) => s.slots);
  const removeRecharge = useRechargesStore((s) => s.removeRecharge);

  /**
   * ✅ Firestoreからリチャージ取得（published=true のみ）
   */
  useEffect(() => {
    const fetchRecharges = async () => {
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();

        const autoCategory = (() => {
          const t = d.title || "";
          if (
            t.includes("ヨガ") ||
            t.includes("運動") ||
            t.includes("ストレッチ")
          )
            return "ワークアウト";
          if (t.includes("散歩") || t.includes("外出")) return "リフレッシュ";
          if (t.includes("瞑想") || t.includes("整理")) return "考えの整理";
          if (t.includes("睡眠") || t.includes("昼寝")) return "疲労回復";
          return "その他";
        })();

        return {
          label: d.title,
          duration: d.duration?.toString() ?? "30",
          recovery: d.recovery ?? 3,
          category: d.category ?? autoCategory,
        };
      }) as RechargeAction[];

      setAllRecharges(data);
    };

    fetchRecharges();
  }, []);

  /**
   * 🔹 イベントとリチャージの結合
   */
  const [combined, setCombined] = useState<CombinedItem[]>([]);
  useEffect(() => {
    const items: CombinedItem[] = events.map((e) => ({
      ...e,
      isRecharge: false,
    }));

    rechargeSlots.forEach((r) => {
      const startDate = new Date(r.start);
      const endDate = new Date(r.end);
      items.push({
        id: r.id,
        summary: r.category,
        start: r.start,
        end: r.end,
        intensity: selectedIntensity[r.id] ?? 0,
        isRecharge: true,
        slotTime: formatTimeRange(startDate, endDate),
        slotCategory: r.category,
      });
    });

    items.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    setCombined(items);
  }, [events, rechargeSlots, selectedIntensity, pickedAction]);

  /**
   * 🔹 強度変更
   */
  function handleIntensityChange(id: string, lvl: number) {
    setSelectedIntensity((p) => ({ ...p, [id]: lvl }));
  }

  const filteredRecharges = allRecharges.filter((r) => r.timeZone === timeZone);

  console.log("⏰ 現在のタイムゾーン:", timeZone);
  console.log("📋 該当リチャージ:", filteredRecharges);

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
                      title={pickedAction[item.id]?.label ?? item.slotCategory!}
                      time={pickedAction[item.id]?.duration ?? item.slotTime!}
                      actions={allRecharges.filter((a) =>
                        a.category?.includes(item.slotCategory ?? "")
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
                      title={
                        pickedAction[item.id]?.label ??
                        item.slotCategory ??
                        "リチャージ"
                      }
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
                start={item.start}
                end={item.end}
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
 * 🔹 時間フォーマット整形
 */
function formatTimeRange(startDate: Date, endDate: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
  const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
  return `${start} - ${end}`;
}
