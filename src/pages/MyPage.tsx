// src/pages/MyPage.tsx
import React, { useEffect, useState } from "react";
import { useRechargesStore } from "../stores/useRechargesStore";
import { CalendarEvent } from "../types/calendar";

const MyPage: React.FC = () => {
  // --- ユーザー情報（仮） ---
  const [userName] = useState("田中 太郎");
  const [avatarUrl] = useState<string | null>(null);

  // --- NextAction の完了判定 ---
  // 1) ハードさの仕分け：Googleカレンダーの全イベントに intensity が選択されているか
  const allIntensities = useRechargesStore.getState().slots; // 実際は events
  const isHardnessDone = Object.values(
    /* 予定ごとの intensity state */ {}
  ).every((v) => v != null);

  // 2) カテゴリーの選択：Zustand store に recharge slot が一つ以上入っているか
  const rechargeSlots = useRechargesStore((s) => s.slots);
  const isCategorySelected = rechargeSlots.length > 0;

  // 3) 具体的な行動選択：各 slot に対して具体的行動が選ばれているか
  const picked = useRechargesStore((s) =>
    s.slots.some((r) => r.actions.length > 0)
  );
  const isSpecificSelected = picked;

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
    <div className="min-h-screen pb-16 bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white px-4 py-2 shadow flex items-center justify-between">
        <h1 className="text-xl font-bold">マイページ</h1>
        <button className="text-2xl">⚙️</button>
      </div>

      <div className="p-4 space-y-6">
        {/* プロフィール */}
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-full bg-gray-200"
            style={{
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <p className="mt-2 text-lg font-medium">{userName}</p>
        </div>

        {/* NextAction */}
        <div>
          <h2 className="text-lg font-semibold mb-2">ネクストアクション</h2>
          <div className="space-y-2">
            {[
              { label: "ハードさの仕分けをした", done: isHardnessDone },
              { label: "カテゴリーの選択", done: isCategorySelected },
              { label: "具体的なリチャージの選択", done: isSpecificSelected },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  item.done
                    ? "bg-teal-500 text-white"
                    : "bg-teal-100 text-gray-700"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 mr-2 rounded-full border ${
                    item.done
                      ? "border-white bg-white"
                      : "border-gray-400 bg-gray-400"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {item.done && <span className="ml-2">✔️</span>}
              </div>
            ))}
          </div>
        </div>

        {/* リチャージの管理へのリンク */}
        <button className="w-full text-left bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">
          <span>リチャージの管理</span>
          <span>→</span>
        </button>

        {/* お知らせ */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">お知らせ</h2>
            <button className="text-sm text-gray-500">全て見る →</button>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center mb-1 space-x-2 text-sm">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-gray-200 rounded text-gray-600"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-gray-500">{n.date}</span>
                </div>
                <p className="text-gray-800">{n.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* その他メニュー */}
        <div className="space-y-2">
          {[
            "プロフィール設定",
            "睡眠の記録",
            "獲得ポイント",
            "ミーティング",
            "設定",
            "お問い合わせ",
            "アンケート",
          ].map((label) => (
            <button
              key={label}
              className="w-full text-left bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center"
            >
              <span>{label}</span>
              <span>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
