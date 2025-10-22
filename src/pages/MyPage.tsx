// src/pages/MyPage.tsx
import React, { useState, useEffect } from "react"; // useEffectをインポート
import { Link, useNavigate } from "react-router-dom";
import { useRechargesStore } from "../stores/useRechargesStore";
import { useProfileStore } from "../stores/useProfileStore";
import { auth } from "../lib/firebase"; // Firebase Authをインポート

const MyPage: React.FC = () => {
  // --- ユーザー情報（Zustandから取得） ---
  const { nickname, avatar, setAvatar, loadProfile } = useProfileStore(); // loadProfileアクションを取得
  const navigate = useNavigate();

  // --- モーダル制御 ---
  const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);

  // 👈 修正: Firebase AuthからユーザーIDを取得し、プロフィールをロードする
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // 認証ユーザーのUIDを使ってFirestoreからプロフィールをロード
        loadProfile(user.uid);
      } else {
        // ログアウト状態の場合の処理（必要に応じて）
        // navigate("/onboarding/register");
      }
    });
    return () => unsubscribe();
  }, [loadProfile, navigate]); // loadProfileが変わることはないが、依存配列に追加

  // --- ネクストアクション ---
  const rechargeSlots = useRechargesStore((s) => s.slots);
  const isHardnessDone = rechargeSlots.every((slot) => slot.intensity != null);
  const isCategorySelected = rechargeSlots.length > 0;
  // Note: slot.actionsのデータ構造が変わっている可能性もあるため、ここでは簡略化
  const isSpecificSelected = rechargeSlots.some((r) => (r as any).title); // 適切なプロパティに変更してください

  // --- お知らせ ---
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

  // --- 選択できるアバター一覧 ---
  const avatarOptions = ["🙂", "😎", "😄", "🤓", "🧘‍♀️", "🏃‍♂️", "🐱", "🌸"];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* === ヘッダー === */}
      <div className="px-4 py-3 border-b flex items-center justify-center bg-white sticky top-0 z-10">
        <h1 className="text-lg font-bold">マイページ</h1>
        {/* <button
          onClick={() => navigate("/mypage/settings")}
          className="text-xl"
          aria-label="設定"
        >
          ⚙️
        </button> */}
      </div>

      <main className="p-4 space-y-6">
        {/* === プロフィール === */}
        <section className="rounded-2xl border bg-white p-4 flex items-center gap-3">
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="text-4xl bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition"
          >
            {avatar}
          </button>
          <div>
            <div className="text-sm text-gray-500">ユーザー名</div>
            {/* 👈 修正: ニックネームがストアから正しく表示される */}
            <div className="text-base font-medium">{nickname || "未設定"}</div>
          </div>
        </section>

        {/* === ネクストアクション === */}
        <section className="rounded-2xl border bg-white p-4">
          <h2 className="text-base font-semibold mb-3">ネクストアクション</h2>
          <ul className="text-sm space-y-1">
            <li>ハードさの仕分けをした {isHardnessDone && "✅"}</li>
            <li>カテゴリーの選択 {isCategorySelected && "✅"}</li>
            <li>具体的なリチャージの選択 {isSpecificSelected && "✅"}</li>
          </ul>
        </section>

        {/* === リチャージの管理 === */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
          <button
            onClick={() => navigate("/mypage/recharges")}
            className="w-full text-left flex items-center justify-between text-blue-600 font-medium"
          >
            <span>リチャージの管理</span>
            <span aria-hidden className="text-gray-400">
              →
            </span>
          </button>
        </section>

        {/* === お知らせ === */}
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

        {/* === 各種リンク === */}
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

      {/* === アバター選択モーダル === */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-center space-y-4">
            <h2 className="font-semibold text-lg mb-2">アイコンを選択</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {avatarOptions.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAvatar(a);
                    setAvatarModalOpen(false);
                  }}
                  className={`text-3xl p-2 rounded-full ${
                    avatar === a
                      ? "bg-blue-100 ring-2 ring-blue-400"
                      : "bg-gray-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAvatarModalOpen(false)}
              className="mt-4 text-sm text-gray-500 underline"
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
