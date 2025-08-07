// src/pages/RechargePage.tsx
import React from "react";
/*import searchIconUrl from "../assets/search.svg";*/

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

const exploreItems: ExploreItem[] = [
  { id: "30s", label: "30代に人気 👍", color: "bg-green-500" },
  { id: "outdoor", label: "アウトドア派 🏕️", color: "bg-yellow-600" },
  { id: "men", label: "男性に人気 👨", color: "bg-purple-500" },
];

const learnItems: LearnItem[] = [
  { id: "workout", label: "ワークアウト💪", color: "bg-pink-500" },
  { id: "refresh", label: "リフレッシュ🍀", color: "bg-green-600" },
  { id: "recovery", label: "疲労回復💖", color: "bg-yellow-400" },
  { id: "organize", label: "考えの整理🧠", color: "bg-blue-800" },
  { id: "prep", label: "準備、対策 📦", color: "bg-amber-700" },
  { id: "sleep", label: "睡眠😴", color: "bg-blue-400" },
];

const RechargePage: React.FC = () => {
  return (
    <div className="p-4">
      {/* ───────────────────────── */}
      {/* ヘッダー */}
      <h1 className="text-center text-xl font-bold mb-6">
        自分に合ったリチャージを見つけましょう
      </h1>

      {/* 提案カード */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-md text-center">
        <h2 className="font-semibold text-lg mb-2">
          GETSETがあなたに合ったリチャージを提案します
        </h2>
        <p className="text-sm text-gray-700">
          様々な条件から、あなたにぴったりのリチャージを用意いたします
        </p>
      </div>

      {/* ───────────────────────── */}
      {/* 探すセクション */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <span className="font-semibold text-lg">探す</span>
        </div>
        <div className="space-y-4">
          {exploreItems.map((item) => (
            <div
              key={item.id}
              className={`${item.color} text-white rounded-xl px-4 py-3`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── */}
      {/* 学ぶセクション */}
      <section>
        <div className="flex items-center mb-4">
          <span className="font-semibold text-lg">学ぶ</span>
          <span role="img" aria-label="本" className="ml-2">
            📖
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {learnItems.map((item) => (
            <div
              key={item.id}
              className={`${item.color} text-white rounded-xl px-4 py-3 text-center`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RechargePage;
