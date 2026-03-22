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

  const accentColor = isRecharge ? "#14B8A6" : getIntensityColor(intensity);

  if (isRecharge) {
    return (
      <div
        className="relative rounded-xl overflow-hidden mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.10)] cursor-pointer bg-white"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        )}
        <div className="px-4 py-3 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              リチャージ
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {displayStart} – {displayEnd}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.10)] cursor-pointer bg-white"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="px-4 py-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5 mb-2">
          {displayStart} – {displayEnd}
        </div>
        {onChange && (
          <IntensitySelector selected={intensity} onSelect={onChange} />
        )}
      </div>
    </div>
  );
};

export default CalendarEventCard;
