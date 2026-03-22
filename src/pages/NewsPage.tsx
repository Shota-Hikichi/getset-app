// src/pages/NewsPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface NewsTag {
  label: string;
  color: "green" | "blue" | "red" | "gray";
}

export interface NewsItem {
  id: string;
  tags: NewsTag[];
  date: string;
  title: string;
  body: string;
  published?: boolean;
}

export const TAG_COLOR_MAP: Record<string, string> = {
  green: "bg-teal-500 text-white",
  blue: "bg-sky-400 text-white",
  red: "bg-rose-500 text-white",
  gray: "bg-slate-400 text-white",
};

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, "news"), where("published", "==", true));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsItem[];
        list.sort((a, b) => (b.date > a.date ? 1 : -1));
        setItems(list);
      } catch (e) {
        console.error("お知らせ取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

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

      <main className="px-4 pt-4 space-y-3">
        {loading ? (
          <div className="text-center text-slate-400 text-[13px] py-10">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-400 text-[13px] py-10">お知らせはありません</div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              to={`/mypage/news/${item.id}`}
              className="block bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(item.tags ?? []).map((tag) => (
                    <span
                      key={tag.label}
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${TAG_COLOR_MAP[tag.color] ?? TAG_COLOR_MAP.gray}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">{item.date}</span>
              </div>
              <p className="text-[14px] text-slate-800 leading-snug">{item.title}</p>
            </Link>
          ))
        )}
      </main>
    </div>
  );
};

export default NewsPage;
