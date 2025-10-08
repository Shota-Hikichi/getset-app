// src/pages/RechargePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

type ExploreItem = {
  id: string;
  label: string;
  color: string;
};

type LearnItem = {
  id: string;
  label: string;
  color: string;
};

// 🔹 「探す」セクションの項目
const exploreItems: ExploreItem[] = [
  { id: "30s", label: "30代に人気 👍", color: "bg-green-500" },
  { id: "outdoor", label: "アウトドア派 🏕️", color: "bg-yellow-600" },
  { id: "men", label: "男性に人気 👨", color: "bg-purple-500" },
];

// 🔹 「学ぶ」セクションの項目
const learnItems: LearnItem[] = [
  { id: "workout", label: "ワークアウト💪", color: "bg-pink-500" },
  { id: "refresh", label: "リフレッシュ🍀", color: "bg-green-600" },
  { id: "recovery", label: "疲労回復💖", color: "bg-yellow-400" },
  { id: "organize", label: "考えの整理🧠", color: "bg-blue-800" },
  { id: "prep", label: "準備・対策 📦", color: "bg-amber-700" },
  { id: "sleep", label: "睡眠😴", color: "bg-blue-400" },
];

const RechargePage: React.FC = () => {
  const navigate = useNavigate();

  // 🔸 カテゴリ遷移処理
  const handleNavigate = (id: string) => {
    navigate(`/recharge/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-200 p-4 pb-24">
      {/* ───────────── ヘッダー ───────────── */}
      <h1 className="text-center text-xl font-bold text-white mb-6">
        自分に合ったリチャージを見つけましょう
      </h1>

      {/* ───────────── 提案カード ───────────── */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-md text-center">
        <h2 className="font-semibold text-lg mb-2 text-gray-800">
          GETSETがあなたに合ったリチャージを提案します
        </h2>
        <p className="text-sm text-gray-600">
          様々な条件から、あなたにぴったりのリチャージを用意しています。
        </p>
      </div>

      {/* ───────────── 探すセクション ───────────── */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <span className="font-semibold text-lg text-white">探す</span>
        </div>
        <div className="space-y-4">
          {exploreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`${item.color} text-white w-full text-left rounded-xl px-4 py-3 font-medium shadow-md hover:opacity-90 active:scale-[0.98] transition`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* ───────────── 学ぶセクション ───────────── */}
      <section>
        <div className="flex items-center mb-4">
          <span className="font-semibold text-lg text-white">学ぶ</span>
          <span role="img" aria-label="本" className="ml-2">
            📖
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {learnItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`${item.color} text-white rounded-xl px-4 py-3 text-center font-medium shadow-md hover:opacity-90 active:scale-[0.98] transition`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RechargePage;
