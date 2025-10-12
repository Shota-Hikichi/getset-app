// src/pages/RechargePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const exploreItems = [
  { id: "30s", label: "30代に人気 👍", color: "bg-green-500" },
  { id: "outdoor", label: "アウトドア派 🏕️", color: "bg-yellow-600" },
  { id: "men", label: "男性に人気 👨", color: "bg-purple-500" },
];

const learnItems = [
  { id: "workout", label: "ワークアウト💪", color: "bg-pink-400" },
  { id: "refresh", label: "リフレッシュ🍀", color: "bg-green-500" },
  { id: "recovery", label: "疲労回復💖", color: "bg-yellow-400" },
  { id: "organize", label: "考えの整理🧠", color: "bg-blue-700" },
  { id: "prep", label: "準備、対策 📦", color: "bg-amber-700" },
  { id: "sleep", label: "睡眠😴", color: "bg-blue-500" },
];

const RechargePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-100 p-4">
      {/* ヘッダー */}
      <h1 className="text-center text-lg font-semibold text-gray-800 mb-6">
        自分に合ったリチャージを見つけましょう
      </h1>

      {/* 提案カード */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/recharge/suggest")}
        className="bg-gradient-to-r from-blue-300 to-blue-200 rounded-2xl shadow-md p-5 mb-8 text-left cursor-pointer"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          GETSETが
          <br />
          あなたに合った
          <br />
          リチャージを提案します
        </h2>
        <p className="text-sm text-gray-700">
          様々な条件から、あなたにぴったりの
          <br />
          リチャージを用意いたします
        </p>
      </motion.div>

      {/* 探すセクション */}
      <section className="mb-8">
        <div className="flex items-center mb-3">
          <span className="font-semibold text-lg text-gray-800">探す</span>
          <Search className="w-5 h-5 text-gray-700 ml-2" />
        </div>
        <div className="space-y-3">
          {exploreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/recharge/${item.id}`)}
              className={`${item.color} w-full py-4 rounded-xl text-white font-semibold shadow hover:opacity-90 transition`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 学ぶセクション */}
      <section className="mb-8">
        <div className="flex items-center mb-3">
          <span className="font-semibold text-lg text-gray-800">学ぶ</span>
          <BookOpen className="w-5 h-5 text-gray-700 ml-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {learnItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/recharge/${item.id}`)}
              className={`${item.color} text-white py-5 rounded-xl font-semibold shadow hover:opacity-90 transition`}
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
