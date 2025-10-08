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

const RechargeCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);

  // Firestore から記事を取得
  useEffect(() => {
    const fetchArticles = async () => {
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
      } catch (err) {
        console.error("記事取得エラー:", err);
      }
    };
    fetchArticles();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-blue-100 pb-16">
      {/* ← 戻るボタン */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
        >
          ←
        </button>
      </div>

      {/* 上部イラスト＋見出し */}
      <div className="flex flex-col items-center text-center px-4">
        <img
          src="/assets/(old)recharge-2.png"
          alt="カテゴリーイラスト"
          className="w-48 h-48 mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">
          {categoryId === "workout"
            ? "30代に人気"
            : categoryId === "refresh"
            ? "リフレッシュ"
            : categoryId}
        </h1>
        <p className="text-gray-700 text-sm leading-relaxed max-w-md">
          ワークアウトは、体力や筋力を向上させるための運動のセッションです。
          有酸素運動と筋力トレーニングを組み合わせて行います。
          個々の目標やレベルに合わせて調整されます。
        </p>
      </div>

      {/* 小見出し */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">短時間でできる</h2>

        {/* 記事カード（2カラム） */}
        <div className="grid grid-cols-2 gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-green-100 rounded-xl p-3 shadow hover:shadow-lg transition"
            >
              <div className="bg-green-200 rounded-md h-28 mb-2 flex items-center justify-center">
                <img
                  src={article.thumbnailUrl || "/assets/sample-thumb.png"}
                  alt={article.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                {article.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {article.description}
              </p>
              <span className="text-xs text-gray-700">{article.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RechargeCategoryPage;
