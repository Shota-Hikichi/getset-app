import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  Shield,
  CreditCard,
  FileText,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

const ConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}> = ({
  open,
  title,
  description,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  onConfirm,
  onClose,
  loading,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 top-[20%] mx-auto max-w-md rounded-2xl bg-white p-4 shadow-2xl">
        <div className="text-base font-semibold">{title}</div>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "処理中…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // お好みで /login などへ
    } catch (e) {
      alert("ログアウトに失敗しました。しばらくしてから再度お試しください。");
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setDeleting(true);
    try {
      // Firestore 側のルートユーザーデータの削除例（保持ポリシーに合わせて調整）
      // 例: users/{uid}/profile/main を消す（サブコレクションを大量に消す場合は Cloud Functions を推奨）
      try {
        await deleteDoc(doc(db, "users", user.uid, "profile", "main"));
      } catch {
        /* プロファイル無い場合は無視 */
      }

      // Firebase Auth のアカウント削除
      await deleteUser(user);
      setConfirmOpen(false);
      navigate("/");
    } catch (e: any) {
      // ※ 最近ログインしていない場合は re-auth が必要
      if (e?.code === "auth/requires-recent-login") {
        alert(
          "セキュリティのため再ログインが必要です。ログインし直してから削除してください。"
        );
      } else {
        alert(
          "アカウント削除に失敗しました。しばらくしてから再度お試しください。"
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
            aria-label="戻る"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">設定</h1>
        </div>
      </header>

      <main className="px-4 pb-24">
        {/* 支払い */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white">
          <Link
            to="/mypage/payment"
            className="flex items-center justify-between px-4 py-4 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
                <CreditCard size={18} />
              </div>
              <div>
                <div className="text-[15px] font-medium text-slate-800">
                  お支払い
                </div>
                <div className="text-xs text-slate-500">
                  プラン・カード情報・自動更新
                </div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" />
          </Link>
        </section>

        {/* 法的情報 */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white">
          <Link
            to="/legal/terms"
            className="flex items-center justify-between px-4 py-4 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-[15px] font-medium text-slate-800">
                  利用規約
                </div>
                <div className="text-xs text-slate-500">Terms of Service</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" />
          </Link>
          <div className="h-px bg-slate-200 mx-4" />
          <Link
            to="/legal/privacy"
            className="flex items-center justify-between px-4 py-4 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-[15px] font-medium text-slate-800">
                  プライバシーポリシー
                </div>
                <div className="text-xs text-slate-500">Privacy Policy</div>
              </div>
            </div>
            <ChevronRight className="text-slate-400" />
          </Link>
        </section>

        {/* アカウント操作 */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-4 py-4 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                <LogOut size={18} />
              </div>
              <div className="text-[15px] font-medium text-slate-800">
                ログアウト
              </div>
            </div>
            <ChevronRight className="text-slate-400" />
          </button>

          <div className="h-px bg-slate-200 mx-4" />

          <button
            onClick={() => setConfirmOpen(true)}
            className="flex w-full items-center justify-between px-4 py-4 hover:bg-rose-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <Trash2 size={18} />
              </div>
              <div className="text-[15px] font-semibold text-rose-600">
                アカウントを削除
              </div>
            </div>
            <ChevronRight className="text-rose-400" />
          </button>
        </section>
      </main>

      {/* 確認モーダル */}
      <ConfirmModal
        open={confirmOpen}
        title="アカウントを削除しますか？"
        description="この操作は取り消せません。データは削除され、復元できません。"
        confirmLabel="完全に削除する"
        onConfirm={handleDeleteAccount}
        onClose={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
};

export default SettingsPage;
