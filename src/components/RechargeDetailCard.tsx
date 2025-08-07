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
      <div className="font-semibold text-lg mb-1">{title}</div>
      <div className="text-sm text-gray-600 mb-4">{time}</div>

      {/* 選択肢リスト */}
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => onSelect(a)}
            className="w-full text-left p-2 bg-gray-100 rounded-md"
          >
            {a.label} — {a.duration} — 回復量 {a.recovery}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RechargeDetailCard;
