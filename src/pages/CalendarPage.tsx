// src/pages/CalendarPage.tsx
import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleApi from "../lib/googleApi";

const CalendarPage: React.FC = () => {
  // 1) カレンダーのイベントデータ
  const [events, setEvents] = useState<EventInput[]>([]);

  // 2) フルカレンダー本体のRef
  const calendarRef = useRef<FullCalendar>(null);

  // 3) 日付ピッカー用の selectedDate state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // 4) 表示モード (日／週／月) 切替用
  const [view, setView] = useState<
    "timeGridDay" | "timeGridWeek" | "dayGridMonth"
  >("dayGridMonth");

  // 5) 初回マウントで Google カレンダーから予定を取得
  useEffect(() => {
    (async () => {
      try {
        await googleApi.initGoogleApi();
        const fetched = await googleApi.listUpcomingEvents();
        setEvents(
          fetched.map((e) => ({
            id: e.id,
            title: e.summary,
            start: e.start,
            end: e.end,
          }))
        );
      } catch (err) {
        console.error("認証または取得に失敗", err);
      }
    })();
  }, []);

  // 6) 日付ピッカーが変わったらその日へジャンプ
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    const calApi = calendarRef.current?.getApi();
    if (calApi) {
      calApi.gotoDate(dateStr);
    }
  };

  return (
    <div className="p-4">
      {/* ──────────── 日付ジャンプセクション ──────────── */}
      <div className="flex items-center mb-4">
        <label htmlFor="date-picker" className="mr-2 font-medium">
          日付を選択：
        </label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border rounded px-3 py-1"
        />
      </div>

      {/* ──────────── 表示切替ボタン ──────────── */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setView("timeGridDay")}
          className={`px-3 py-1 rounded ${
            view === "timeGridDay" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          日表示
        </button>
        <button
          onClick={() => setView("timeGridWeek")}
          className={`px-3 py-1 rounded ${
            view === "timeGridWeek" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          週表示
        </button>
        <button
          onClick={() => setView("dayGridMonth")}
          className={`px-3 py-1 rounded ${
            view === "dayGridMonth" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          月表示
        </button>
      </div>

      {/* ──────────── カレンダー本体 ──────────── */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        height="auto"
        headerToolbar={false}
        events={events}
        viewDidMount={(arg) => {
          // ビュー切り替え時にも反映させる
          if (arg.view.type !== view) {
            arg.view.calendar.changeView(view);
          }
        }}
        datesSet={(arg) => {
          // 遷移先の日付を picker に反映
          const d = arg.start;
          setSelectedDate(d.toISOString().slice(0, 10));
        }}
      />
    </div>
  );
};

export default CalendarPage;
