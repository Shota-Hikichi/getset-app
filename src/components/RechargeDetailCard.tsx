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
  // リチャージ → 緑、それ以外 → 白
  const bgColor = isRecharge ? "#A7F3D0" : "#FFFFFF";

  return (
    <div
      className="rounded-xl p-4 mb-3 shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {/* タイトル・時間 */}
      <div className="font-semibold text-lg mb-1 break-words whitespace-pre-wrap leading-snug">
        {title}
      </div>
      <div className="text-sm text-gray-600 mb-4">{time}</div>

      {/* 選択肢リスト */}
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => onSelect(a)}
            className="w-full text-left p-3 bg-white/70 hover:bg-white rounded-md shadow-sm transition whitespace-normal break-words leading-snug"
          >
            <div className="text-sm font-medium text-gray-800 mb-1">
              {a.label}
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-between flex-wrap">
              <span>所要時間：{a.duration}分 ／ 回復量：</span>
              <span className="text-yellow-400">
                {"★".repeat(a.recovery)}
                {"☆".repeat(5 - a.recovery)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RechargeDetailCard;
