// src/pages/Home.tsx
import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { nanoid } from "nanoid";

import GoogleCalendar from "../components/GoogleCalendar";
import { useProgressStore } from "../stores/useProgressStore";
import { useRechargesStore } from "../stores/useRechargesStore";

const Home: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sleepHours, maxEvents, totalDuration } = useProgressStore();
  const addRecharge = useRechargesStore((s) => s.addRecharge);

  const prevDay = () => setCurrentDate((d) => addDays(d, -1));
  const nextDay = () => setCurrentDate((d) => addDays(d, 1));

  // 白いボタンから呼ぶ追加ロジック
  const handleAddRecharge = () => {
    // とりあえず今の日付の09:00-09:00で追加
    const time = "09:00 - 09:00";
    addRecharge({
      id: nanoid(),
      time,
      category: "リチャージ",
      actions: [],
    });
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
        <GoogleCalendar />
      </div>
    </div>
  );
};

export default Home;
