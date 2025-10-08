// src/pages/RechargeArticleDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type ArticleDetail = {
  id: string;
  title: string;
  description: string;
  content?: string;
  thumbnailUrl: string;
  category: string;
  tags?: string[];
};

const RechargeArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetail | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      const ref = doc(db, "recharge_articles", id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setArticle({ id: snapshot.id, ...snapshot.data() } as ArticleDetail);
      }
    };
    fetchArticle();
  }, [id]);

  if (!article) {
    return <div className="text-center mt-20 text-gray-600">読み込み中...</div>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-200 to-blue-100 flex flex-col">
      {/* 🔙 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition"
        aria-label="戻る"
      >
        ←
      </button>

      {/* サムネイル */}
      <div className="relative w-full h-60 sm:h-80">
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button className="bg-white p-2 rounded-full shadow-md">♡</button>
          <button className="bg-white p-2 rounded-full shadow-md">📅</button>
        </div>
      </div>

      {/* 記事内容 */}
      <div className="flex-1 bg-white rounded-t-3xl mt-[-1rem] p-6 shadow-md overflow-y-auto">
        <h1 className="text-xl font-bold mb-3">{article.title}</h1>

        {/* タグ */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 説明 */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          {article.description}
        </p>

        {/* 本文（改行を反映） */}
        {article.content && (
          <div className="text-gray-800 leading-relaxed space-y-6 whitespace-pre-line">
            {article.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeArticleDetail;
