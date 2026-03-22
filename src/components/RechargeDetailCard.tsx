// src/components/RechargeDetailCard.tsx
import React from "react";
import type { RechargeAction } from "../types/recharge";

type Props = {
  title: string;
  time: string;
  actions: RechargeAction[];
  onSelect: (action: RechargeAction) => void;
  isRecharge?: boolean;
};

const RechargeDetailCard: React.FC<Props> = ({
  title,
  time,
  actions,
  onSelect,
  isRecharge = true,
}) => {
  const accentColor = "#14B8A6";

  return (
    <div
      className="rounded-xl overflow-hidden mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.10)] bg-white"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="p-4">
        {/* バッジ + タイトル・時間 */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: accentColor }}
          >
            リチャージ
          </span>
        </div>
        <div className="font-semibold text-slate-800 text-base mb-0.5 break-words whitespace-pre-wrap leading-snug">
          {title}
        </div>
        <div className="text-xs text-slate-500 mb-4">{time}</div>

        {/* 選択肢リスト */}
        <div className="space-y-2">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => onSelect(a)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-white rounded-xl shadow-sm transition whitespace-normal break-words leading-snug border border-slate-100"
            >
              <div className="text-sm font-medium text-slate-800 mb-1">
                {a.label}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between flex-wrap">
                <span>所要時間：{a.duration}分 ／ 回復量：</span>
                <span className="text-amber-400">
                  {"★".repeat(a.recovery)}
                  {"☆".repeat(5 - a.recovery)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RechargeDetailCard;
