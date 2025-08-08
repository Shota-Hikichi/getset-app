import React, { useEffect, useState } from "react";
import type { CalendarEvent } from "../types/calendar";
import type { RechargeAction } from "../types/recharge";
import CalendarEventCard from "./CalendarEventCard";
import RechargeDetailCard from "./RechargeDetailCard";
import { useRechargesStore } from "../stores/useRechargesStore";
import { formatTime } from "../utils/formatTime"; // ユーティリティでフォーマット関数を用意

interface Props {
  events: CalendarEvent[];
}

export default function GoogleCalendar({ events }: Props) {
  const [selectedIntensity, setSelectedIntensity] = useState<
    Record<string, number>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickedAction, setPickedAction] = useState<
    Record<string, RechargeAction>
  >({});

  const rechargeSlots = useRechargesStore((s) => s.slots);
  const removeRecharge = useRechargesStore((s) => s.removeRecharge);

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

    items.sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    setCombined(items);
  }, [events, rechargeSlots, selectedIntensity, pickedAction]);

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

function addMinutes(start: string, duration: string): string {
  const [h, m] = start.split(":").map((n) => parseInt(n, 10));
  const d = parseInt(duration.replace(/\D/g, ""), 10);
  const total = h * 60 + m + d;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
}

function formatTimeRange(startDate: Date, endDate: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const start = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
  const end = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
  return `${start} - ${end}`;
}

interface CombinedItem extends CalendarEvent {
  isRecharge: boolean;
  slotTime?: string;
  slotCategory?: string;
}

const SAMPLE_ACTIONS: RechargeAction[] = [
  { label: "ホットヨガ", duration: "30分", recovery: 4 },
  { label: "屋上庭園でストレッチ", duration: "60分", recovery: 5 },
  { label: "散歩", duration: "15分", recovery: 3 },
];
