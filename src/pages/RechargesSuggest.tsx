// src/pages/RechargesSuggest.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRechargesStore } from "../stores/useRechargesStore";
// import type { RechargeSlot } from "../stores/useRechargesStore"; // 必要に応じて型をインポート

interface RechargeCard {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string; // 表示用 (例: "60分")
  image: string;
}

const mockRecharges: RechargeCard[] = [
  {
    id: 1,
    title: "サイクリング",
    description:
      "サイクリングはランニングに比べて身体的負荷が軽く、有酸素運動としてリフレッシュに最適です。",
    category: "ワークアウト",
    duration: "60分",
    image: "https://cdn-icons-png.flaticon.com/512/825/825501.png",
  },
  {
    id: 2,
    title: "瞑想",
    description:
      "短時間でも心を落ち着かせ、思考を整理し、集中力を高めることができます。",
    category: "考えの整理",
    duration: "15分",
    image: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
  },
  {
    id: 3,
    title: "ストレッチ",
    description:
      "軽いストレッチは血流を改善し、疲労回復や気分転換に効果的です。",
    category: "ワークアウト",
    duration: "10分",
    image: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png",
  },
  {
    id: 4,
    title: "昼寝",
    description: "20分の仮眠は疲労回復と集中力アップに最適です。",
    category: "睡眠",
    duration: "20分",
    image: "https://cdn-icons-png.flaticon.com/512/4151/4151051.png",
  },
  {
    id: 5,
    title: "自然散歩",
    description:
      "外の空気を吸って歩くことで、リフレッシュしながら心身のバランスを整えられます。",
    category: "リフレッシュ",
    duration: "30分",
    image: "https://cdn-icons-png.flaticon.com/512/619/619034.png",
  },
];

// '60分' のような文字列から分数を抽出するヘルパー関数
const parseDuration = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30; // 見つからなければデフォルト30分
};

const RechargeSuggest: React.FC = () => {
  const navigate = useNavigate();
  // --- 👇 修正箇所 ---
  // ストアのアクション名を addRecharge から addSlot に変更
  const addSlot = useRechargesStore((s) => s.addSlot);
  // --- 👆 修正ここまで ---
  const [index, setIndex] = useState(0);
  const current = mockRecharges[index];

  const next = () => setIndex((i) => (i + 1) % mockRecharges.length);

  const handleLike = () => {
    // --- 👇 修正箇所 ---
    const now = new Date();
    // duration (例: "60分") から分数をパースして終了時刻を計算
    const durationMinutes = parseDuration(current.duration);
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    // addSlot に渡すオブジェクトを RechargeSlot の型に合わせる
    addSlot({
      // id: String(current.id), // id は addSlot 内部で自動生成されるため不要
      label: current.title, // title を label プロパティにマッピング
      start: now.toISOString(),
      end: endTime.toISOString(), // 計算した終了時刻
      category: current.category,
      // time, actions, intensity などのプロパティは addSlot のデフォルト値に任せる
    });
    // --- 👆 修正ここまで ---
    next();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6bc3f2] via-[#9ed9f5] to-[#e9f7ff] flex flex-col items-center justify-between px-6 py-6 text-slate-800">
      {/* --- ヘッダー --- */}
      <div className="w-full flex items-center mb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-white bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-sm"
        >
          ←
        </button>
      </div>

      {/* --- 上部テキスト & ページネーション --- */}
      <div className="text-center mb-2 mt-2">
        <h2 className="text-xl font-semibold text-white drop-shadow-sm mb-2">
          リチャージのご提案
        </h2>
        <p className="text-sm text-white/90 mb-3 leading-relaxed">
          リチャージとはより高いパフォーマンスを発揮するために
          <br />
          役立つ活動です。興味があるリチャージを登録してください。
        </p>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-white font-semibold"
        >
          {index + 1} / {mockRecharges.length}
        </motion.div>
      </div>

      {/* --- カード --- */}
      <div className="relative flex-1 flex items-center justify-center w-full mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 50, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -40, rotate: -3 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative bg-white rounded-[28px] shadow-xl p-6 w-full max-w-xs text-center"
          >
            <div className="absolute -top-3 -right-4 bg-sky-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              New
            </div>

            <img
              src={current.image}
              alt={current.title}
              className="w-24 h-24 mx-auto mb-4"
            />
            <h3 className="text-lg font-bold mb-2">{current.title}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {current.description}
            </p>

            <div className="flex justify-around text-sm mt-4">
              <div>
                <p className="text-slate-500">カテゴリ</p>
                <p className="font-semibold text-[#2b7db3]">
                  {current.category}
                </p>
              </div>
              <div>
                <p className="text-slate-500">所要時間</p>
                <p className="font-semibold">{current.duration}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- アクションボタン --- */}
      <div className="flex justify-center gap-6 mb-6 mt-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={next}
          className="bg-gray-300 text-slate-800 px-6 py-2 rounded-full shadow flex items-center gap-2"
        >
          👎 スキップ
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="bg-gradient-to-r from-sky-500 to-sky-400 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          👍 登録する
        </motion.button>
      </div>
    </div>
  );
};

export default RechargeSuggest;
