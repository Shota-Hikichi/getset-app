// src/components/CalendarEventCard.tsx
import React from "react";
import { getIntensityColor } from "../utils/getIntensityColor";
// getIntensityIcons はもう使わないので削除
import IntensitySelector from "./IntensitySelector";

type Props = {
  id: string;
  title: string;
  start: string;
  end: string;
  intensity: number;
  onChange?: (level: number) => void;
  isRecharge?: boolean;
  onDelete?: () => void;
};

const CalendarEventCard: React.FC<Props> = ({
  id,
  title,
  start,
  end,
  intensity,
  onChange,
  isRecharge = false,
  onDelete,
}) => {
  const formatTime = (dt: string) => {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    const hh = d.getHours();
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const displayStart = isRecharge ? start : formatTime(start);
  const displayEnd = isRecharge ? end : formatTime(end);

  // リチャージは緑固定、それ以外は強度に応じて
  const bgColor = isRecharge ? "#A7F3D0" : getIntensityColor(intensity);

  return (
    <div
      className="relative rounded-xl p-4 mb-3 shadow-md text-white cursor-pointer"
      style={{ backgroundColor: bgColor }}
    >
      {/* 削除ボタン */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 text-white opacity-75 hover:opacity-100"
        >
          ✕
        </button>
      )}

      {/* タイトル */}
      <div className="text-sm font-semibold">{title}</div>

      {/* 時刻 */}
      <div className="text-xs mb-2">
        {displayStart} – {displayEnd}
      </div>

      {/* 丸アイコン（右側セレクタ）のみ表示、リチャージは非表示 */}
      {!isRecharge && onChange && (
        <div className="mt-2">
          <IntensitySelector selected={intensity} onSelect={onChange} />
        </div>
      )}
    </div>
  );
};

export default CalendarEventCard;
