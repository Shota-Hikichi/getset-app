import React, { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { ja } from "date-fns/locale";
import { nanoid } from "nanoid";

import HeaderDateNav from "../components/HeaderDateNav";
import TodayConditionCard from "../components/TodayConditionCard";
import PrimaryCTA from "../components/PrimaryCTA";
import GoogleCalendar from "../components/GoogleCalendar";
import Footer from "../components/Footer";

import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
import { getRandomRecharge } from "../utils/randomRecharge";
import { findRechargeGaps } from "../utils/findRechargeGap";
import googleApi from "../lib/googleApi";

import type { CalendarEvent } from "../types/calendar";
import type { RechargeSlot } from "../types/recharge";

const Home: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { sleepHours, maxEvents, totalDuration } = useProgressStore();
  const addRecharge = useRechargesStore((s) => s.addRecharge);

  // ---- Google Calendar Events ----
  useEffect(() => {
    (async () => {
      try {
        await googleApi.initGoogleApi();
        const fetched = await googleApi.listUpcomingEvents();
        setEvents(fetched);
      } catch (err) {
        console.error("カレンダー取得エラー:", err);
      }
    })();
  }, []);

  // ---- 日付操作 ----
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

    const startTimeStr = start.toTimeString().slice(0, 5);
    const endTimeStr = end.toTimeString().slice(0, 5);

    const newRecharge = getRandomRecharge();

    // ✅ RechargeSlot 構造に合わせて作成
    const rechargeEvent: RechargeSlot = {
      id: nanoid(),
      start: start.toISOString(),
      end: end.toISOString(),
      time: `${startTimeStr} - ${endTimeStr}`,
      category: newRecharge.category,
      title: newRecharge.title,
      actions: [],
      intensity: 3,
    };

    addRecharge(rechargeEvent);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2b7db3] via-[#3aa1d9] to-[#69c2ec] text-slate-900 flex flex-col pb-24">
      {/* 上部ナビ */}
      <div className="pt-4">
        <HeaderDateNav
          date={currentDate}
          onPrev={prevDay}
          onNext={nextDay}
          className="mx-auto max-w-[480px]"
        />
      </div>

      <main className="flex-1 mx-auto w-full max-w-[480px] px-4 mt-2 space-y-6">
        {/* コンディション */}
        <section>
          <h2 className="text-white/95 text-lg font-semibold mb-2">
            今日のコンディション
          </h2>
          <TodayConditionCard
            title="バランス指数"
            description="眠眠が少し不足しています。バランスは取れていますが、早めの休息を意識して疲労感を残さないようにしましょう。"
            stats={[
              {
                id: "sleep",
                label: "睡眠",
                valueText: `${sleepHours}h`,
                percent: 70,
                icon: "moon",
              },
              {
                id: "max",
                label: "MAX予定数",
                valueText: `${maxEvents}件`,
                percent: 35,
                icon: "flame",
              },
              {
                id: "total",
                label: "予定総時間",
                valueText: `${totalDuration}h`,
                percent: 80,
                icon: "pie",
              },
            ]}
          />
        </section>

        {/* CTA */}
        <section>
          <PrimaryCTA
            label="リチャージを予定に入れる"
            onClick={handleAddRecharge}
          />
        </section>

        {/* 今日の予定 */}
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
