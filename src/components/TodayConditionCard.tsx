import React, { useState, useEffect, useRef } from "react";
import SleepInputModal from "./SleepInputModal";
import type { CalendarEvent } from "../types/calendar";
import type { BalanceStatus } from "../utils/calculateBalance";

interface TodayConditionCardProps {
  title: string;
  events: CalendarEvent[];
  balanceScore?: number;
  status?: BalanceStatus;
  sleepHours?: number;
  maxEvents?: number;
  totalDuration?: number;
}

const TodayConditionCard: React.FC<TodayConditionCardProps> = ({
  title,
  events,
  balanceScore = 70,
  status = "normal",
  sleepHours = 0,
  maxEvents = 3,
  totalDuration = 4,
}) => {
  const [showModal, setShowModal] = useState(false);

  /** 🎨 顔アイコン */
  const FaceIcon = () => {
    switch (status) {
      case "good":
        return (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FFD93B" />
            <path
              d="M8 15c1.5 1 6.5 1 8 0"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8.5" cy="10" r="1" fill="#000" />
            <circle cx="15.5" cy="10" r="1" fill="#000" />
          </svg>
        );
      case "tired":
        return (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#AAB9BF" />
            <path
              d="M8 15c2-1.5 6-1.5 8 0"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M7 9l2 2M9 9l-2 2M15 9l2 2M17 9l-2 2"
              stroke="#000"
              strokeWidth="1.2"
            />
          </svg>
        );
      default:
        return (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FFE680" />
            <path
              d="M8 15h8"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8.5" cy="10" r="1" fill="#000" />
            <circle cx="15.5" cy="10" r="1" fill="#000" />
          </svg>
        );
    }
  };

  /** 🎯 円ゲージ用のアニメーション付きSVG */
  const AnimatedCircleGauge: React.FC<{
    value: number;
    max: number;
    children: React.ReactNode;
  }> = ({ value, max, children }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const [animatedValue, setAnimatedValue] = useState(value);
    const prevValue = useRef(value);

    // valueが変わったらアニメーション
    useEffect(() => {
      const start = prevValue.current;
      const end = value;
      const duration = 800; // ms
      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = start + (end - start) * eased;
        setAnimatedValue(current);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      prevValue.current = value;
    }, [value]);

    const percent = Math.min(animatedValue / max, 1) * 100;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative w-16 h-16 mb-2">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="transform -rotate-90"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#fff"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  /** 各アイコン */
  const SleepIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white opacity-90"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M12.75 2.25a9.75 9.75 0 108.986 13.5 9.75 9.75 0 01-8.986-13.5z" />
    </svg>
  );
  const FireIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white opacity-90"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C10 4 8 8 8 10c0 2 1 5 4 5s4-3 4-5-2-6-4-8zM6 14c0 4 3 8 6 8s6-4 6-8" />
    </svg>
  );
  const PieIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white opacity-90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v10l6 4" />
    </svg>
  );

  return (
    <div className="bg-white/15 rounded-2xl p-5 ring-1 ring-white/20 shadow-sm text-white/90 backdrop-blur-md">
      {/* 上段 */}
      <div className="flex items-start space-x-4 mb-4">
        <FaceIcon />
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-1">{title}</h3>
          <p className="text-sm leading-snug opacity-90">
            {status === "good"
              ? "バランスは良好です！快調な一日を。"
              : status === "normal"
              ? "眠眠が少し不足しています。早めの休息を意識しましょう。"
              : "疲労が溜まっています。しっかりリチャージを取りましょう。"}
          </p>
          <p className="text-xs opacity-80 mt-1">スコア：{balanceScore}</p>
        </div>
      </div>

      {/* 下段（3つの円ゲージ） */}
      <div className="grid grid-cols-3 text-center mt-3 text-white/85">
        {/* 💤 睡眠 */}
        <div
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <AnimatedCircleGauge value={sleepHours} max={8}>
            <SleepIcon />
          </AnimatedCircleGauge>
          <p className="text-sm font-medium">睡眠</p>
          <p className="text-sm font-semibold">{sleepHours}h</p>
        </div>

        {/* 🔥 MAX予定数 */}
        <div className="flex flex-col items-center">
          <AnimatedCircleGauge value={maxEvents} max={5}>
            <FireIcon />
          </AnimatedCircleGauge>
          <p className="text-sm font-medium">MAX予定数</p>
          <p className="text-sm font-semibold">{maxEvents}件</p>
        </div>

        {/* ⏱ 予定総時間 */}
        <div className="flex flex-col items-center">
          <AnimatedCircleGauge value={totalDuration} max={8}>
            <PieIcon />
          </AnimatedCircleGauge>
          <p className="text-sm font-medium">予定総時間</p>
          <p className="text-sm font-semibold">{totalDuration}h</p>
        </div>
      </div>

      <SleepInputModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default TodayConditionCard;
