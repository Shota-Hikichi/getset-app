import React from "react";
import { Moon, Flame, PieChart } from "lucide-react";

export type ConditionStat = {
  id: string;
  label: string;
  valueText: string;
  percent: number;
  icon: "moon" | "flame" | "pie";
};

type Props = {
  title: string;
  description: string;
  stats: ConditionStat[];
};

const iconFor = (name: ConditionStat["icon"]) => {
  switch (name) {
    case "moon":
      return <Moon className="h-4 w-4" />;
    case "flame":
      return <Flame className="h-4 w-4" />;
    case "pie":
      return <PieChart className="h-4 w-4" />;
  }
};

const TodayConditionCard: React.FC<Props> = ({ title, description, stats }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#8ac7e9]/80 to-[#60b7e5]/80 p-5 shadow-md ring-1 ring-white/30 backdrop-blur-sm">
      {/* 上部：バランス指数タイトル + アイコン + 説明文 */}
      <div className="flex items-start gap-3">
        {/* 左：仮画像（将来動的に差し替え） */}
        <div className="h-14 w-14 rounded-xl overflow-hidden flex items-center justify-center bg-white/25 shadow-inner ring-1 ring-white/30">
          <img
            src="/assets/condition-good.png"
            alt="condition icon"
            className="object-contain h-full w-full"
          />
        </div>

        {/* 右：タイトルと説明文 */}
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{title}</div>
          <p className="text-white/95 text-xs mt-1 leading-relaxed">
            {description}{" "}
            <a
              href="#"
              className="underline text-white hover:text-sky-200 font-medium"
              onClick={(e) => e.preventDefault()}
            >
              詳しくみる
            </a>
          </p>
        </div>
      </div>

      {/* 下部：3つの統計（睡眠・予定数・総時間） */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {stats.map((s) => (
          <div key={s.id} className="flex flex-col items-center text-white/95">
            <div className="relative">
              <svg width="48" height="48" viewBox="0 0 48 48">
                {/* 外枠（背景円） */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* 進捗リング */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="white"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(s.percent / 100) * 2 * Math.PI * 20} ${
                    2 * Math.PI * 20
                  }`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </svg>

              {/* 中央アイコン */}
              <div className="absolute inset-0 flex items-center justify-center">
                {iconFor(s.icon)}
              </div>
            </div>

            {/* ラベル・値 */}
            <div className="text-xs mt-1">{s.label}</div>
            <div className="text-sm font-semibold">{s.valueText}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayConditionCard;
