// src/pages/MyPage.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useRechargesStore } from "../stores/useRechargesStore";
import { useProfileStore } from "../stores/useProfileStore";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NewsItem, TAG_COLOR_MAP } from "./NewsPage";

const MyPage: React.FC = () => {
  const { nickname, avatar, setAvatar, loadProfile } = useProfileStore();
  const navigate = useNavigate();
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NewsItem[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) loadProfile(user.uid);
    });
    return () => unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = query(collection(db, "news"), where("published", "==", true));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsItem[];
        list.sort((a, b) => (b.date > a.date ? 1 : -1));
        setNotifications(list.slice(0, 2));
      } catch (e) {
        console.error("お知らせ取得エラー:", e);
      }
    };
    fetchNews();
  }, []);

  const rechargeSlots = useRechargesStore((s) => s.slots);
  const isHardnessDone = rechargeSlots.every((slot) => slot.intensity != null);
  const isCategorySelected = rechargeSlots.length > 0;
  const isSpecificSelected = rechargeSlots.some((r) => (r as any).title);

  const avatarOptions = ["🙂", "😎", "😄", "🤓", "🧘‍♀️", "🏃‍♂️", "🐱", "🌸"];

  const menuItems = [
    { label: "プロフィール設定", to: "/mypage/profile" },
    { label: "睡眠の記録", to: "/mypage/sleep" },
    { label: "獲得ポイント", to: "/mypage/points" },
    { label: "ミーティング", to: "/mypage/meeting" },
    { label: "設定", to: "/mypage/settings" },
    { label: "お問い合わせ", to: "/mypage/contact" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-center">
        <h1 className="text-[17px] font-semibold text-slate-900">マイページ</h1>
      </header>

      <main className="px-4 pt-4 space-y-3">
        {/* プロフィール */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 hover:scale-105 transition-transform"
          >
            {avatar}
          </button>
          <div>
            <div className="text-[12px] text-slate-400 leading-none mb-1">ユーザー名</div>
            <div className="text-[16px] font-medium text-slate-900">{nickname || "未設定"}</div>
          </div>
        </section>

        {/* ネクストアクション */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-2.5">ネクストアクション</h2>
          <ul className="space-y-1.5">
            {[
              { label: "ハードさの仕分けをした", done: isHardnessDone },
              { label: "カテゴリーの選択", done: isCategorySelected },
              { label: "具体的なリチャージの選択", done: isSpecificSelected },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[14px] text-slate-700">
                <span>{item.label}</span>
                {item.done && <span className="text-base">✅</span>}
              </li>
            ))}
          </ul>
        </section>

        {/* リチャージの管理 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => navigate("/mypage/recharges")}
            className="w-full flex items-center justify-between px-4 py-4 active:bg-slate-50 transition-colors"
          >
            <span className="text-[15px] font-medium text-sky-500">リチャージの管理</span>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        </section>

        {/* お知らせ */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[15px] font-semibold text-slate-900">お知らせ</h2>
            <Link to="/mypage/news" className="text-[13px] text-sky-500">
              全て見る →
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                to={`/mypage/news/${n.id}`}
                className="block bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {(n.tags ?? []).map((tag) => (
                    <span
                      key={tag.label}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TAG_COLOR_MAP[tag.color] ?? TAG_COLOR_MAP.gray}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                  <span className="text-[11px] text-slate-400 ml-1">{n.date}</span>
                </div>
                <div className="text-[14px] text-slate-800">{n.title}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* メニューリスト */}
        <section className="space-y-2 pb-4">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 active:bg-slate-50 transition-colors"
            >
              <span className="text-[15px] text-slate-800">{item.label}</span>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>
          ))}
        </section>
      </main>

      {/* アバター選択モーダル */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-80 text-center space-y-4 shadow-2xl">
            <h2 className="font-semibold text-[16px] text-slate-900">アイコンを選択</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {avatarOptions.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAvatar(a);
                    setAvatarModalOpen(false);
                  }}
                  className={`text-3xl p-2.5 rounded-full transition-all ${
                    avatar === a
                      ? "bg-sky-100 ring-2 ring-sky-400 scale-110"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAvatarModalOpen(false)}
              className="text-[13px] text-slate-400 underline"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
