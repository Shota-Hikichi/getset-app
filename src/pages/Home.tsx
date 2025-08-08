import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { nanoid } from "nanoid";

import GoogleCalendar from "../components/GoogleCalendar";
import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";
import { getRandomRecharge } from "../utils/randomRecharge";
import type { RechargeEvent } from "../types/calendar";
import { findRechargeGaps } from "../utils/findRechargeGap";
import type { CalendarEvent } from "../types/calendar";
import googleApi from "../lib/googleApi";

const Home: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    (async () => {
      await googleApi.initGoogleApi();
      const fetched = await googleApi.listUpcomingEvents();
      setEvents(fetched);
    })();
  }, []);

  const { sleepHours, maxEvents, totalDuration } = useProgressStore();
  const addRecharge = useRechargesStore((s) => s.addRecharge);

  const prevDay = () => setCurrentDate((d) => addDays(d, -1));
  const nextDay = () => setCurrentDate((d) => addDays(d, 1));

  const handleAddRecharge = () => {
    const durationMin = 30;
    const gaps = findRechargeGaps(events, durationMin);

    if (gaps.length === 0) {
      alert("リチャージを挿入できる時間帯が見つかりませんでした");
      return;
    }

    // ✅ ランダムな空き時間を1つ選ぶ
    const randomGap = gaps[Math.floor(Math.random() * gaps.length)];
    const start = new Date(randomGap.start);
    const end = new Date(start.getTime() + durationMin * 60000);

    const startTimeStr = start.toTimeString().slice(0, 5);
    const endTimeStr = end.toTimeString().slice(0, 5);

    const newRecharge = getRandomRecharge();

    const rechargeEvent = {
      id: nanoid(),
      title: `【${newRecharge.category}】${newRecharge.title}`,
      start: start.toISOString(),
      end: end.toISOString(),
      intensity: 3,
      category: newRecharge.category,
      actions: [],
      time: `${startTimeStr} - ${endTimeStr}`,
    };

    addRecharge(rechargeEvent);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-400 to-blue-200">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={prevDay} className="text-white text-2xl">
          ←
        </button>
        <h2 className="text-white text-lg font-semibold">
          {format(currentDate, "yyyy年M月d日 EEEE", { locale: ja })}
        </h2>
        <button onClick={nextDay} className="text-white text-2xl">
          →
        </button>
      </div>

      {/* コンディションカード */}
      <div className="mx-4 bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-gray-800 text-base font-medium">
          今日のコンディション
        </h3>
        <p className="text-gray-600 text-sm mt-2">
          ハードな予定とリチャージのバランスを可視化します。
        </p>
        <div className="mt-5 flex justify-between">
          <div className="text-center">
            <p className="text-gray-800 font-semibold">睡眠</p>
            <p className="text-gray-600 mt-1">{sleepHours}h</p>
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-semibold">MAX予定数</p>
            <p className="text-gray-600 mt-1">{maxEvents}件</p>
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-semibold">予定総時間</p>
            <p className="text-gray-600 mt-1">{totalDuration}h</p>
          </div>
        </div>
      </div>

      {/* 白い楕円のリチャージ追加ボタン */}
      <div className="mx-4 mt-4">
        <button
          onClick={handleAddRecharge}
          className="w-full py-4 bg-white rounded-full text-blue-600 font-medium shadow-lg"
        >
          リチャージを予定に入れる →
        </button>
      </div>

      {/* 今日の予定リスト */}
      <div className="flex-1 overflow-y-auto mt-6 px-4 pb-4">
        <h4 className="text-white text-lg font-semibold mb-2">今日の予定</h4>
        <GoogleCalendar events={events} />
      </div>
    </div>
  );
};

export default Home;
