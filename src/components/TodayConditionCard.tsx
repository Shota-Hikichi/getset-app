// src/components/TodayConditionCard.tsx
import React, { useState } from "react";
import type { CalendarEvent } from "../types/calendar";
import SleepInputModal from "./SleepInputModal";

interface TodayConditionCardProps {
  title: string;
  events: CalendarEvent[];
  balanceScore: number;
  status: string;
  sleepHours: number;
  maxEvents: number;
  totalDuration: number;
}

// 円弧インジケーター付きメトリクスコンポーネント
const MetricCircle: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  onClick?: () => void;
}> = ({ icon, value, label, onClick }) => {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.72; // 約3/4の円弧

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer active:scale-95 transition-transform" : ""}`}
      onClick={onClick}
    >
      <div className="relative w-[64px] h-[64px]">
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* 背景トラック */}
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="#EEF7FD"
            stroke="#C8E6F5"
            strokeWidth="2.5"
          />
          {/* 進捗アーク */}
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="#4EB5E5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference - arc}`}
            transform="rotate(-126 32 32)"
          />
        </svg>
        {/* アイコン */}
        <div className="absolute inset-0 flex items-center justify-center text-[#4EB5E5]">
          {icon}
        </div>
      </div>
      <span className="text-[18px] font-bold text-slate-700 leading-none">
        {value}
      </span>
      <span className="text-[11px] text-slate-400 leading-tight text-center">
        {label}
      </span>
    </div>
  );
};

// SVGアイコン（MUIの代わりにシンプルなSVGを使用）
const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

const EventIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
);

// バランス指数アイコン
const BalanceIcon: React.FC<{ score: number }> = ({ score }) => {
  if (score === 0) {
    return (
      <span className="text-[26px] font-bold text-slate-300">?</span>
    );
  }
  if (score < 50) return <span className="text-[26px]">😞</span>;
  if (score < 80) return <span className="text-[26px]">🙂</span>;
  return <span className="text-[26px]">😄</span>;
};

const TodayConditionCard: React.FC<TodayConditionCardProps> = ({
  balanceScore = 0,
  status = "normal",
  sleepHours = 0,
  maxEvents = 0,
  totalDuration = 0,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 上段：バランス指数 + 説明 */}
      <div className="flex items-start gap-4 p-5 pb-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-[56px] h-[56px] rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <BalanceIcon score={balanceScore} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 whitespace-nowrap">
            バランス指数
          </span>
        </div>
        <p className="text-[12px] text-slate-500 leading-relaxed pt-1">
          ハードな予定とリチャージの予定のバランスがどの程度とれているかの指標がバランス指数です。予定のハードさの選択とリチャージ提案を受けるとバランス指数が表示されます。
        </p>
      </div>

      {/* 区切り */}
      <div className="h-px bg-slate-100 mx-5" />

      {/* 下段：3つのメトリクス */}
      <div className="grid grid-cols-3 px-4 py-4 gap-2">
        <MetricCircle
          icon={<MoonIcon />}
          value={`${sleepHours}h`}
          label="睡眠"
          onClick={() => setShowModal(true)}
        />
        <MetricCircle
          icon={<EventIcon />}
          value={`${maxEvents}個`}
          label="MAX予定数"
        />
        <MetricCircle
          icon={<ClockIcon />}
          value={`${totalDuration}h`}
          label="予定総時間"
        />
      </div>

      <SleepInputModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default TodayConditionCard;
