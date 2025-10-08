// src/pages/RechargeCategoryPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
};

const RechargeCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!categoryId) return;
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
    };
    fetchArticles();
  }, [categoryId]);

  const imageSrc = categoryImages[categoryId || ""] || "/assets/default.png";
  const categoryLabel = categoryLabels[categoryId || ""] || "リチャージ";
  const categoryDescription =
    categoryDescriptions[categoryId || ""] || "心身を整えるリチャージです。";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-100 flex flex-col">
      {/* 🔙 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition"
        aria-label="戻る"
      >
        ←
      </button>

      {/* ヘッダー */}
      <div className="text-center px-6 pt-20">
        <img
          src={imageSrc}
          alt={categoryLabel}
          className="mx-auto mb-4 w-36 h-36 object-contain"
        />
        <h1 className="text-2xl font-bold mb-2">{categoryLabel}</h1>
        <p className="text-gray-700 text-sm leading-relaxed">
          {categoryDescription}
        </p>
      </div>

      {/* 記事リスト */}
      <div className="px-6 mt-6 space-y-6">
        <h2 className="font-semibold text-lg text-gray-800 mb-2">
          短時間でできる
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/recharge/article/${article.id}`)}
              className="bg-green-100 rounded-xl p-3 cursor-pointer hover:bg-green-200 transition"
            >
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="w-full h-28 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold text-sm text-gray-800 mb-1">
                {article.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2">
                {article.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">{article.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RechargeCategoryPage;
