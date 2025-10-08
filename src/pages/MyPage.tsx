// src/pages/MyPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRechargesStore } from "../stores/useRechargesStore";

const MyPage: React.FC = () => {
  // --- ユーザー情報（仮） ---
  const [userName] = useState("田中 太郎");
  const [avatarUrl] = useState<string | null>(null);

  // --- NextAction の完了判定 ---
  const rechargeSlots = useRechargesStore((s) => s.slots);
  const isHardnessDone = rechargeSlots.every((slot) => slot.intensity != null);
  const isCategorySelected = rechargeSlots.length > 0;
  const isSpecificSelected = rechargeSlots.some((r) => r.actions.length > 0);

  // --- サンプル「お知らせ」データ ---
  const [notifications] = useState([
    {
      id: 1,
      tags: ["#HR", "#アンケート"],
      date: "2024/01/20",
      title: "第一回アンケート開催中",
    },
    {
      id: 2,
      tags: ["#重要"],
      date: "2024/01/20",
      title: "カウンセリングの予約",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
        <h1 className="text-lg font-bold">マイページ</h1>
        <span className="text-xl" aria-hidden>
          ⚙️
        </span>
      </div>

      <main className="p-4 space-y-6">
        {/* プロフィール（表示） */}
        <section className="rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" /> : null}
            </div>
            <div>
              <div className="text-sm text-gray-500">ユーザー名</div>
              <div className="text-base font-medium">{userName}</div>
            </div>
          </div>
        </section>

        {/* ネクストアクション */}
        <section className="rounded-2xl border bg-white p-4">
          <h2 className="text-base font-semibold mb-3">ネクストアクション</h2>
          <ul className="text-sm space-y-1">
            <li>ハードさの仕分けをした {isHardnessDone && "✅"}</li>
            <li>カテゴリーの選択 {isCategorySelected && "✅"}</li>
            <li>具体的なリチャージの選択 {isSpecificSelected && "✅"}</li>
          </ul>
        </section>

        {/* リチャージの管理へのリンク（例） */}
        <section className="rounded-2xl border bg-white p-4">
          <Link
            to="/recharge"
            className="block rounded-xl border px-4 py-3 hover:bg-gray-50 transition"
          >
            リチャージの管理 →
          </Link>
        </section>

        {/* お知らせ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">お知らせ</h2>
            <Link
              to="/admin/notifications"
              className="text-sm text-sky-600 underline"
            >
              全て見る →
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  {n.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-gray-100">
                      {t}
                    </span>
                  ))}
                  <span>{n.date}</span>
                </div>
                <div className="text-sm">{n.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* その他メニュー：ここを Link 化する */}
        <section className="space-y-2">
          <Link
            to="/mypage/profile"
            className="block rounded-2xl border bg-white px-4 py-4 shadow-sm hover:bg-gray-50 active:opacity-80 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">プロフィール設定</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>

          {/* 他の項目は必要に応じて Link へ */}
          <Link
            to="/mypage/sleep"
            className="block rounded-2xl border bg-white px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">睡眠の記録</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>

          <Link
            to="/mypage/points"
            className="block rounded-2xl border bg-white px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">獲得ポイント</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>

          <Link
            to="/mypage/meeting"
            className="block rounded-2xl border bg-white px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">ミーティング</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>

          <Link
            to="/mypage/settings"
            className="block rounded-2xl border bg-white px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">設定</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>
          <Link
            to="/mypage/contact"
            className="block rounded-2xl border bg-white px-4 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px]">お問い合わせ</span>
              <span aria-hidden className="text-gray-400">
                →
              </span>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default MyPage;
