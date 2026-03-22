// src/pages/RechargePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const exploreItems = [
  { id: "30s", label: "30代に人気 👍", color: "#5CAF84" },
  { id: "outdoor", label: "アウトドア派 🏕️", color: "#C8843A" },
  { id: "men", label: "男性に人気 👨", color: "#8B72C0" },
];

const learnItems = [
  { id: "workout", label: "ワークアウト💪", color: "#D4698A" },
  { id: "refresh", label: "リフレッシュ🍀", color: "#5CAF84" },
  { id: "recovery", label: "疲労回復💖", color: "#D4A83A" },
  { id: "organize", label: "考えの整理🧠", color: "#4B82C0" },
  { id: "prep", label: "準備・対策📦", color: "#9B6040" },
  { id: "sleep", label: "睡眠😴", color: "#4B9FC0" },
];

const RechargePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: "linear-gradient(to bottom, #B8D9EE, #D5EBF7, #EDF6FB)",
      }}
    >
      <div className="px-4 pt-6">
        {/* ヘッダー */}
        <h1 className="text-center text-[17px] font-semibold text-slate-800 mb-5">
          自分に合ったリチャージを見つけましょう
        </h1>

        {/* 提案カード */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/recharge/suggest")}
          className="rounded-2xl shadow-sm p-5 mb-7 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #A8CEDE 0%, #C6DFF0 100%)",
          }}
        >
          <h2 className="text-[17px] font-bold text-slate-800 mb-2 leading-snug">
            GETSETが
            <br />
            あなたに合った
            <br />
            リチャージを提案します
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            様々な条件から、あなたにぴったりの
            <br />
            リチャージを用意いたします
          </p>
        </motion.div>

        {/* 探すセクション */}
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-[15px] text-slate-800">探す</span>
          </div>
          <div className="space-y-2.5">
            {exploreItems.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/recharge/${item.id}`)}
                className="w-full py-4 rounded-xl text-white font-semibold text-[15px] shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: item.color }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* 学ぶセクション */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-[15px] text-slate-800">学ぶ</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {learnItems.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/recharge/${item.id}`)}
                className="text-white py-5 rounded-xl font-semibold text-[14px] shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: item.color }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RechargePage;
