// src/pages/NewsDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { TAG_COLOR_MAP, NewsItem } from "./NewsPage";

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const snap = await getDoc(doc(db, "news", id));
        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() } as NewsItem);
        }
      } catch (e) {
        console.error("お知らせ詳細取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-slate-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-slate-400 text-sm">お知らせが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full text-slate-600 hover:bg-slate-100 mr-2"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-[17px] font-semibold text-slate-900">お知らせ</h1>
      </header>

      <main className="px-4 pt-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {(item.tags ?? []).map((tag) => (
              <span
                key={tag.label}
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${TAG_COLOR_MAP[tag.color] ?? TAG_COLOR_MAP.gray}`}
              >
                {tag.label}
              </span>
            ))}
            <span className="text-[11px] text-slate-400 ml-1">{item.date}</span>
          </div>

          <h2 className="text-[17px] font-semibold text-slate-900 leading-snug mb-4">
            {item.title}
          </h2>

          <div className="h-px bg-slate-100 mb-4" />

          <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line">
            {item.body}
          </p>
        </div>
      </main>
    </div>
  );
};

export default NewsDetailPage;
