// src/pages/RechargeArticleDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
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

const RechargeArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "recharge_articles", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setArticle({ id: snapshot.id, ...snapshot.data() } as ArticleDetail);
        }
      } catch (e) {
        console.error("記事取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #B8D9EE, #D5EBF7, #EDF6FB)" }}
      >
        <p className="text-slate-400 text-[13px]">読み込み中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(to bottom, #B8D9EE, #D5EBF7, #EDF6FB)" }}
      >
        <p className="text-slate-500 text-[14px]">記事が見つかりませんでした</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sky-500 text-[13px] font-medium"
        >
          ← 戻る
        </button>
      </div>
    );
  }

  const accentColor = categoryColors[article.category] ?? "#4B9FC0";

  return (
    <div className="relative min-h-screen bg-[#F7F8FA] flex flex-col">
      {/* サムネイル */}
      <div className="relative w-full h-56 sm:h-72 flex-shrink-0 overflow-hidden">
        {article.thumbnailUrl ? (
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-7xl"
            style={{ backgroundColor: accentColor + "33" }}
          >
            ✨
          </div>
        )}
        {/* 戻るボタン（サムネイル上） */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-700 hover:bg-white transition-colors"
          aria-label="戻る"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* 記事内容 */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-5 pt-6 pb-24 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* アクセントライン */}
        <div
          className="h-1 w-10 rounded-full mb-4"
          style={{ backgroundColor: accentColor }}
        />

        {/* タグ */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[12px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: accentColor + "1A",
                  color: accentColor,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* タイトル */}
        <h1 className="text-[20px] font-bold text-slate-900 mb-3 leading-snug">
          {article.title}
        </h1>

        {/* 説明 */}
        <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
          {article.description}
        </p>

        {/* 本文 */}
        {article.content && (
          <div className="text-[14px] text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
            {article.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeArticleDetail;
