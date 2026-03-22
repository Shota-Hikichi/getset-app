// src/pages/RechargeCategoryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

type Article = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
};

const categoryColors: Record<string, string> = {
  workout: "#D4698A",
  refresh: "#5CAF84",
  recovery: "#D4A83A",
  organize: "#4B82C0",
  prep: "#9B6040",
  sleep: "#4B9FC0",
  "30s": "#5CAF84",
  outdoor: "#C8843A",
  men: "#8B72C0",
};

const categoryImages: Record<string, string> = {
  workout: "/assets/workout.png",
  refresh: "/assets/refresh-illustration.png",
  recovery: "/assets/recovery-illustration.png",
  organize: "/assets/organize-illustration.png",
  prep: "/assets/prep-illustration.png",
  sleep: "/assets/sleep-illustration.png",
};

const categoryLabels: Record<string, string> = {
  workout: "ワークアウト💪",
  refresh: "リフレッシュ🍀",
  recovery: "疲労回復💖",
  organize: "考えの整理🧠",
  prep: "準備・対策📦",
  sleep: "睡眠😴",
  "30s": "30代に人気 👍",
  outdoor: "アウトドア派 🏕️",
  men: "男性に人気 👨",
};

const categoryDescriptions: Record<string, string> = {
  workout:
    "ワークアウトは、体力や筋力を向上させるための運動セッションです。有酸素運動（ランニング、サイクリングなど）と筋力トレーニングを組み合わせて行います。ワークアウトは個々の目標やレベルに合わせて調整されます。",
  refresh:
    "リフレッシュは、心身のリセットを目的とした活動です。散歩や深呼吸、自然に触れるなど、日常のストレスを和らげる方法が含まれます。",
  recovery:
    "疲労回復は、体の回復を促すための休息や軽い運動を行うことです。マッサージや温浴なども効果的です。",
  organize:
    "考えや感情の整理は、心のデトックスです。日記を書いたり、瞑想したりすることで、思考を整理します。",
  prep: "準備・対策は、先を見据えて計画を立てる時間です。集中力を高め、安心して行動できるようになります。",
  sleep:
    "睡眠は心身をリセットする最も基本的なリチャージです。質の高い睡眠を取ることで、翌日のパフォーマンスが向上します。",
  "30s": "30代に特に人気のリチャージをまとめました。忙しい毎日でも取り入れやすいものを厳選しています。",
  outdoor: "アウトドア派のあなたに合ったリチャージです。自然の中で心身をリフレッシュしましょう。",
  men: "男性に人気のリチャージをご紹介します。効率よく回復できる方法を厳選しました。",
};

const RechargeCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!categoryId) return;
      try {
        const q = query(
          collection(db, "recharge_articles"),
          where("category", "==", categoryId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Article[];
        setArticles(data);
      } catch (e) {
        console.error("記事取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [categoryId]);

  const key = categoryId ?? "";
  const accentColor = categoryColors[key] ?? "#4B9FC0";
  const imageSrc = categoryImages[key];
  const categoryLabel = categoryLabels[key] ?? "リチャージ";
  const categoryDescription =
    categoryDescriptions[key] ?? "心身を整えるリチャージです。";

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: "linear-gradient(to bottom, #B8D9EE, #D5EBF7, #EDF6FB)",
      }}
    >
      {/* 戻るボタン */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
          aria-label="戻る"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* ヒーローエリア */}
      <div className="text-center px-6 pt-2 pb-6">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={categoryLabel}
            className="mx-auto mb-4 w-32 h-32 object-contain"
          />
        ) : (
          <div
            className="mx-auto mb-4 w-32 h-32 rounded-2xl flex items-center justify-center text-5xl"
            style={{ backgroundColor: accentColor + "22" }}
          >
            {categoryLabel.match(/[^\w\s]/u)?.[0] ?? "✨"}
          </div>
        )}

        <h1 className="text-[22px] font-bold text-slate-800 mb-3">
          {categoryLabel}
        </h1>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-4 text-left shadow-sm">
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {categoryDescription}
          </p>
        </div>
      </div>

      {/* 記事リスト */}
      <div className="px-4">
        <h2 className="font-semibold text-[14px] text-slate-500 uppercase tracking-wider mb-3 px-1">
          短時間でできる
        </h2>

        {loading ? (
          <div className="text-center text-slate-400 text-[13px] py-10">
            読み込み中...
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-5 py-10 text-center shadow-sm">
            <p className="text-[14px] text-slate-400">
              記事がまだ登録されていません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/recharge/article/${article.id}`)}
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                {article.thumbnailUrl ? (
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-full h-28 object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-28 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: accentColor + "22" }}
                  >
                    {categoryLabel.match(/[^\w\s]/u)?.[0] ?? "✨"}
                  </div>
                )}
                <div className="p-3">
                  <div
                    className="h-1 w-8 rounded-full mb-2"
                    style={{ backgroundColor: accentColor }}
                  />
                  <h3 className="font-semibold text-[13px] text-slate-800 mb-1 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  {article.duration && (
                    <p className="text-[11px] text-slate-400">{article.duration}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeCategoryPage;
