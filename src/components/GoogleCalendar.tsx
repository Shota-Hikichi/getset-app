// src/components/GoogleCalendar.tsx
import React, { useEffect, useState } from "react";
import googleApi from "../lib/googleApi";
import type { CalendarEvent } from "../types/calendar";
import CalendarEventCard from "./CalendarEventCard";
import RechargeDetailCard from "./RechargeDetailCard";
import type { RechargeAction } from "../types/recharge";
import { useRechargesStore } from "../stores/useRechargesStore";

type CombinedItem = CalendarEvent & {
  isRecharge: boolean;
  slotTime?: string;
  slotCategory?: string;
};

function normalizeDate(
  val: string | { dateTime?: string; date?: string }
): string {
  return typeof val === "string" ? val : val.dateTime ?? val.date ?? "";
}

export default function GoogleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<
    Record<string, number>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedAction, setPickedAction] = useState<
    Record<string, RechargeAction>
  >({});

  const rechargeSlots = useRechargesStore((s) => s.slots);
  const removeRecharge = useRechargesStore((s) => s.removeRecharge);

  // イベント取得
  useEffect(() => {
    (async () => {
      await googleApi.initGoogleApi();
      const fetched = await googleApi.listUpcomingEvents();
      setEvents(
        fetched.map((e) => ({
          id: e.id,
          summary: e.summary,
          start: normalizeDate(e.start),
          end: normalizeDate(e.end),
          intensity: 0,
        }))
      );
    })();
  }, []);

  // CombinedItem 作成
  const [combined, setCombined] = useState<CombinedItem[]>([]);
  useEffect(() => {
    const items: CombinedItem[] = events.map((e) => ({
      ...e,
      isRecharge: false,
    }));
    rechargeSlots.forEach((r, idx) => {
      const [s, e] = r.time.split(" - ");
      items.splice(Math.min(idx + 1, items.length), 0, {
        id: r.id,
        summary: r.category,
        start: s,
        end: pickedAction[r.id]
          ? addMinutes(s, pickedAction[r.id].duration)
          : e,
        intensity: selectedIntensity[r.id] ?? 0,
        isRecharge: true,
        slotTime: r.time,
        slotCategory: r.category,
      });
    });
    setCombined(items);
  }, [events, rechargeSlots, selectedIntensity, pickedAction]);

  // 強度変更ハンドラ
  function handleIntensityChange(id: string, lvl: number) {
    setSelectedIntensity((p) => ({ ...p, [id]: lvl }));
  }

  return (
    <div className="space-y-2">
      {combined.map((item) =>
        item.isRecharge ? (
          <React.Fragment key={item.id}>
            {expandedId === item.id ? (
              <RechargeDetailCard
                title={pickedAction[item.id]?.label ?? item.slotCategory!}
                time={pickedAction[item.id]?.duration ?? item.slotTime!}
                actions={SAMPLE_ACTIONS}
                onSelect={(action) => {
                  setPickedAction((p) => ({ ...p, [item.id]: action }));
                  setExpandedId(null);
                }}
                isRecharge
              />
            ) : (
              <div onClick={() => setExpandedId(item.id)}>
                <CalendarEventCard
                  id={item.id}
                  title={pickedAction[item.id]?.label ?? item.slotCategory!}
                  start={item.start}
                  end={item.end}
                  intensity={selectedIntensity[item.id] ?? 0}
                  onChange={(lvl) => handleIntensityChange(item.id, lvl)}
                  isRecharge
                  onDelete={() => removeRecharge(item.id)}
                />
              </div>
            )}
          </React.Fragment>
        ) : (
          <CalendarEventCard
            key={item.id}
            id={item.id}
            title={item.summary}
            start={item.start}
            end={item.end}
            intensity={selectedIntensity[item.id] ?? item.intensity}
            onChange={(lvl) => handleIntensityChange(item.id, lvl)}
          />
        )
      )}
    </div>
  );
}

// ヘルパー: 時間を分足し
function addMinutes(start: string, duration: string): string {
  const [h, m] = start.split(":").map((n) => parseInt(n, 10));
  const d = parseInt(duration.replace(/\D/g, ""), 10);
  const total = h * 60 + m + d;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
}

// サンプルアクション
const SAMPLE_ACTIONS: RechargeAction[] = [
  { label: "ホットヨガ", duration: "30分", recovery: 4 },
  { label: "屋上庭園でストレッチ", duration: "60分", recovery: 5 },
  { label: "散歩", duration: "15分", recovery: 3 },
];
