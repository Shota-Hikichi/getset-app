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

interface Props {
  events: CalendarEvent[];
}

interface CombinedItem extends CalendarEvent {
  isRecharge: boolean;
  slotTime?: string;
  slotCategory?: string;
}

export default function GoogleCalendar({ events }: Props) {
  const [selectedIntensity, setSelectedIntensity] = useState<
    Record<string, number>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedAction, setPickedAction] = useState<
    Record<string, RechargeAction>
  >({});
  const [allRecharges, setAllRecharges] = useState<RechargeAction[]>([]); // 🔹 Firestore全データを保持

  const rechargeSlots = useRechargesStore((s) => s.slots);
  const removeRecharge = useRechargesStore((s) => s.removeRecharge);

  // ✅ Firestoreからpublished=trueのリチャージを取得
  useEffect(() => {
    const fetchRecharges = async () => {
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          label: d.title,
          duration: d.duration?.toString() ?? "30",
          recovery: d.recovery ?? 3,
          category: d.category ?? "未分類",
        };
      }) as RechargeAction[];
      setAllRecharges(data);
    };
    fetchRecharges();
  }, []);

  // 🔹 イベントとリチャージを結合
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

  // 強度変更
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
                // ✅ カテゴリー一致のみ表示
                actions={allRecharges.filter(
                  (a) => a.category === item.slotCategory
                )}
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
                  start={formatTime(item.start)}
                  end={formatTime(item.end)}
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

function formatTimeRange(startDate: Date, endDate: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
  const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
  return `${start} - ${end}`;
}
