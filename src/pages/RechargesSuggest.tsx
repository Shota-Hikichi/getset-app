// src/pages/RechargesSuggest.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { useRechargesStore } from "../stores/useRechargesStore";

interface RechargeCard {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  image: string;
  stars: number;
  isNew?: boolean;
}

const mockRecharges: RechargeCard[] = [
  {
    id: 1,
    title: "サイクリング",
    description:
      "サイクリングはランニングに比べて身体的負荷が軽く、有酸素運動としてリフレッシュに最適です。定期的に行うことで体力や心肺機能の向上にもつながります。",
    category: "ワークアウト",
    duration: "60分",
    image: "https://cdn-icons-png.flaticon.com/512/825/825501.png",
    stars: 2,
    isNew: true,
  },
  {
    id: 2,
    title: "瞑想",
    description:
      "短時間でも心を落ち着かせ、思考を整理し、集中力を高めることができます。呼吸に意識を向けることで、ストレスを効果的に手放せます。",
    category: "考えの整理",
    duration: "15分",
    image: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    stars: 4,
    isNew: true,
  },
  {
    id: 3,
    title: "ストレッチ",
    description:
      "軽いストレッチは血流を改善し、疲労回復や気分転換に効果的です。デスクワークの合間に取り入れると生産性が上がります。",
    category: "ワークアウト",
    duration: "10分",
    image: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png",
    stars: 3,
  },
  {
    id: 4,
    title: "昼寝",
    description:
      "20分の仮眠は疲労回復と集中力アップに最適です。午後の眠気を効果的にリセットできます。",
    category: "睡眠",
    duration: "20分",
    image: "https://cdn-icons-png.flaticon.com/512/4151/4151051.png",
    stars: 5,
  },
  {
    id: 5,
    title: "自然散歩",
    description:
      "外の空気を吸って歩くことで、リフレッシュしながら心身のバランスを整えられます。緑の多い場所を歩くとさらに効果的です。",
    category: "リフレッシュ",
    duration: "30分",
    image: "https://cdn-icons-png.flaticon.com/512/619/619034.png",
    stars: 4,
    isNew: true,
  },
];

const parseDuration = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 30;
};

const SWIPE_THRESHOLD = 100;

// ── 個別カード（ドラッグ対応） ──────────────────────────────────────
interface SwipeCardProps {
  card: RechargeCard;
  onAccept: () => void;
  onReject: () => void;
  isTop: boolean;
  stackIndex: number; // 0=top, 1=second, 2=third
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  card,
  onAccept,
  onReject,
  isTop,
  stackIndex,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const acceptOpacity = useTransform(x, [40, 130], [0, 1], { clamp: true });
  const rejectOpacity = useTransform(x, [-130, -40], [1, 0], { clamp: true });

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onAccept();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onReject();
    }
  };

  const scaleY = 1 - stackIndex * 0.04;
  const translateY = stackIndex * 10;
  const opacity = 1 - stackIndex * 0.25;

  return (
    <motion.div
      className="absolute w-full"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: scaleY,
        y: translateY,
        opacity,
        zIndex: 10 - stackIndex,
        originX: 0.5,
        originY: 1,
        top: 0,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={isTop ? { left: -50, right: 50 } : undefined}
      dragElastic={isTop ? 0.7 : 0}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-5 pt-5 pb-5 mx-auto w-full relative select-none">
        {/* New バッジ */}
        {card.isNew && (
          <div className="absolute -top-3 right-4 bg-sky-400 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
            New
          </div>
        )}

        {/* スワイプ判定オーバーレイ（topカードのみ） */}
        {isTop && (
          <>
            <motion.div
              className="absolute inset-0 rounded-[24px] bg-emerald-400/20 flex items-start justify-start p-5 pointer-events-none"
              style={{ opacity: acceptOpacity }}
            >
              <span className="text-emerald-600 font-bold text-[18px] border-2 border-emerald-500 rounded-lg px-2 py-0.5 rotate-[-15deg]">
                登録する ✓
              </span>
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-[24px] bg-rose-400/20 flex items-start justify-end p-5 pointer-events-none"
              style={{ opacity: rejectOpacity }}
            >
              <span className="text-rose-500 font-bold text-[18px] border-2 border-rose-400 rounded-lg px-2 py-0.5 rotate-[15deg]">
                スキップ ✗
              </span>
            </motion.div>
          </>
        )}

        {/* イラスト */}
        <div className="flex justify-center mb-3">
          <img
            src={card.image}
            alt={card.title}
            className="w-28 h-28 object-contain"
            draggable={false}
          />
        </div>

        {/* タイトル */}
        <h3 className="text-[19px] font-bold text-slate-800 text-center mb-2">
          {card.title}
        </h3>

        {/* 説明 */}
        <p className="text-[12px] text-slate-500 leading-relaxed text-center mb-4 line-clamp-3">
          {card.description}
        </p>

        {/* 星 */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-[18px] ${i < card.stars ? "text-amber-400" : "text-slate-200"}`}>
              ★
            </span>
          ))}
        </div>

        {/* カテゴリ・所要時間 */}
        <div className="border-t border-slate-100 pt-4 flex justify-around">
          <div className="text-center">
            <p className="text-[11px] text-slate-400 mb-0.5">リチャージカテゴリー</p>
            <p className="text-[13px] font-semibold text-sky-500">{card.category}</p>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-[11px] text-slate-400 mb-0.5">所要時間</p>
            <p className="text-[13px] font-semibold text-slate-700">{card.duration}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── メインページ ──────────────────────────────────────────────────────
const RechargeSuggest: React.FC = () => {
  const navigate = useNavigate();
  const addSlot = useRechargesStore((s) => s.addSlot);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // 戻れるよう保持
  const directionRef = useRef<"left" | "right">("right");

  const total = mockRecharges.length;
  const isDone = index >= total;

  const handleAccept = () => {
    const card = mockRecharges[index];
    directionRef.current = "right";
    const now = new Date();
    const durationMinutes = parseDuration(card.duration);
    const endTime = new Date(now.getTime() + durationMinutes * 60000);
    addSlot({
      label: card.title,
      start: now.toISOString(),
      end: endTime.toISOString(),
      category: card.category,
    });
    setHistory((h) => [...h, index]);
    setIndex((i) => i + 1);
  };

  const handleReject = () => {
    directionRef.current = "left";
    setHistory((h) => [...h, index]);
    setIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (history.length === 0) {
      navigate(-1);
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setIndex(prev);
  };

  return (
    <div
      className="min-h-screen flex flex-col pb-8"
      style={{
        background: "linear-gradient(to bottom, #B8D9EE, #D5EBF7, #EDF6FB)",
      }}
    >
      {/* ヘッダー */}
      <header className="px-4 pt-5 pb-2 flex items-center">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      </header>

      {/* タイトル・説明 */}
      <div className="px-6 pt-1 pb-4 text-center">
        <h1 className="text-[18px] font-bold text-slate-800 mb-2">
          リチャージのご提案
        </h1>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          リチャージとはより高いパフォーマンスを発揮するために
          <br />
          役立つ活動です。興味があるリチャージを登録してください。
        </p>
      </div>

      {/* プログレス */}
      {!isDone && (
        <div className="text-center mb-4">
          <span className="text-[14px] font-semibold text-slate-600">
            {index + 1} / {total}
          </span>
          <div className="flex justify-center gap-1.5 mt-2">
            {mockRecharges.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 20 : 6,
                  backgroundColor: i < index ? "#38BDF8" : i === index ? "#0EA5E9" : "#CBD5E1",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* カードエリア */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {isDone ? (
          /* 完了画面 */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] shadow-xl px-6 py-10 text-center w-full"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-[18px] font-bold text-slate-800 mb-2">
              提案が終わりました！
            </h2>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              登録したリチャージはマイページから確認できます。
            </p>
            <button
              onClick={() => navigate("/recharge")}
              className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-semibold text-[15px] hover:bg-sky-600 transition-colors"
            >
              リチャージ一覧に戻る
            </button>
          </motion.div>
        ) : (
          /* カードスタック */
          <div className="relative w-full" style={{ height: 380 }}>
            <AnimatePresence>
              {/* 奥の2枚（非インタラクティブ） */}
              {[2, 1].map((offset) => {
                const cardIndex = index + offset;
                if (cardIndex >= total) return null;
                return (
                  <SwipeCard
                    key={`bg-${mockRecharges[cardIndex].id}`}
                    card={mockRecharges[cardIndex]}
                    onAccept={() => {}}
                    onReject={() => {}}
                    isTop={false}
                    stackIndex={offset}
                  />
                );
              })}

              {/* 手前のカード（インタラクティブ） */}
              <motion.div
                key={mockRecharges[index].id}
                className="absolute w-full"
                initial={
                  directionRef.current === "right"
                    ? { x: 400, opacity: 0, rotate: 10 }
                    : { x: -400, opacity: 0, rotate: -10 }
                }
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={
                  directionRef.current === "right"
                    ? { x: 500, opacity: 0, rotate: 15 }
                    : { x: -500, opacity: 0, rotate: -15 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ zIndex: 20 }}
              >
                <SwipeCard
                  card={mockRecharges[index]}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isTop={true}
                  stackIndex={0}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      {!isDone && (
        <div className="px-6 mt-4">
          <div className="flex gap-3">
            {/* 登録しない */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:bg-white transition-colors"
            >
              <ThumbsDown size={22} className="text-slate-400" />
              <span className="text-[13px] font-semibold">登録しない</span>
            </motion.button>

            {/* 左右ナビ（中央） */}
            <div className="flex flex-col items-center justify-center gap-2">
              <button
                onClick={handleReject}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                aria-label="前へ"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleAccept}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                aria-label="次へ"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 登録する */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAccept}
              className="flex-1 flex flex-col items-center gap-1.5 py-4 bg-sky-500 rounded-2xl shadow-sm text-white hover:bg-sky-600 transition-colors"
            >
              <ThumbsUp size={22} />
              <span className="text-[13px] font-semibold">登録する</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargeSuggest;
