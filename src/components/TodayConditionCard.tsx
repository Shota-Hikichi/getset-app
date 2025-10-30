// src/components/TodayConditionCard.tsx
import React, { useState } from "react"; // 🔽 useState をインポート
import type { CalendarEvent } from "../types/calendar";
import SleepInputModal from "./SleepInputModal"; // 🔽 SleepInputModal をインポート

// 🔽 Material-UI のアイコンをインポート
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied"; // 悪い
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"; // 普通
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied"; // 良い
import BedtimeIcon from "@mui/icons-material/Bedtime"; // 睡眠
import EventNoteIcon from "@mui/icons-material/EventNote"; // MAX予定数
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // 予定総時間

interface TodayConditionCardProps {
  title: string;
  events: CalendarEvent[];
  balanceScore: number;
  status: string; // (status は props として受け取る)
  sleepHours: number;
  maxEvents: number;
  totalDuration: number;
}

const TodayConditionCard: React.FC<TodayConditionCardProps> = ({
  title,
  events, // (events は props として受け取る)
  balanceScore = 70,
  status = "normal", // (status は props として受け取る)
  sleepHours = 0,
  maxEvents = 3,
  totalDuration = 4,
}) => {
  // 🔽 モーダル表示用の State を復活
  const [showModal, setShowModal] = useState(false);

  // 🔽 バランススコアに応じたアイコンを選択するロジック (変更なし)
  const getBalanceIcon = (score: number) => {
    if (score < 50) {
      // スコアが低い場合は悪い状態
      return (
        <SentimentVeryDissatisfiedIcon className="text-red-500 text-5xl" />
      );
    } else if (score < 80) {
      // スコアが中程度の場合は普通の状態
      return <SentimentSatisfiedAltIcon className="text-yellow-500 text-5xl" />;
    } else {
      // スコアが高い場合は良い状態
      return <SentimentVerySatisfiedIcon className="text-green-500 text-5xl" />;
    }
  };

  // 🔽 balanceScore の色付けロジック (変更なし)
  const getScoreColorClass = (score: number) => {
    if (score < 50) return "text-red-500";
    if (score < 80) return "text-yellow-500";
    return "text-green-500";
  };

  // 🔽 メッセージを選択するロジック (status に基づく)
  const getStatusMessage = (statusKey: string) => {
    switch (statusKey) {
      case "good":
        return "バランスは良好です！快調な一日を。";
      case "tired":
        return "疲労が溜まっています。しっかりリチャージを取りましょう。";
      default: // normal
        return "睡眠が少し不足しています。早めの休息を意識しましょう。";
    }
  };

  return (
    <div className="bg-white/15 rounded-2xl p-5 ring-1 ring-white/20 shadow-sm text-white/90 backdrop-blur-md">
      {/* 上段 */}
      <div className="flex items-start space-x-4 mb-4">
        {/* 🔽 アイコン表示を修正 */}
        <div className="bg-white/10 p-2 rounded-full">
          {getBalanceIcon(balanceScore)}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-base font-semibold mb-1">{title}</h3>
          {/* 🔽 メッセージ表示を修正 */}
          <p className="text-sm leading-snug opacity-90">
            {getStatusMessage(status)}
          </p>
          <p
            className={`text-sm font-bold mt-1 ${getScoreColorClass(
              balanceScore
            )}`}
          >
            スコア：{balanceScore}
          </p>
        </div>
      </div>

      {/* 下段（3つの円ゲージ） */}
      <div className="grid grid-cols-3 text-center mt-3 text-white/85 pt-4 border-t border-white/20">
        {/* 💤 睡眠 (修正: onClick を復活) */}
        <div
          onClick={() => setShowModal(true)} // 👈 修正: onClick を復活
          className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="bg-white/10 p-2 rounded-full mb-2">
            <BedtimeIcon className="text-blue-300 text-3xl" />
          </div>
          <p className="text-sm font-medium">睡眠</p>
          <p className="text-lg font-semibold">{sleepHours}h</p>
        </div>

        {/* 🔥 MAX予定数 (変更なし) */}
        <div className="flex flex-col items-center">
          <div className="bg-white/10 p-2 rounded-full mb-2">
            <EventNoteIcon className="text-purple-300 text-3xl" />
          </div>
          <p className="text-sm font-medium">MAX予定数</p>
          <p className="text-lg font-semibold">{maxEvents}件</p>
        </div>

        {/* ⏱ 予定総時間 (変更なし) */}
        <div className="flex flex-col items-center">
          <div className="bg-white/10 p-2 rounded-full mb-2">
            <AccessTimeIcon className="text-green-300 text-3xl" />
          </div>
          <p className="text-sm font-medium">予定総時間</p>
          <p className="text-lg font-semibold">{totalDuration}h</p>
        </div>
      </div>

      {/* 🔽 モーダルコンポーネントの呼び出しを復活 */}
      <SleepInputModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default TodayConditionCard;
