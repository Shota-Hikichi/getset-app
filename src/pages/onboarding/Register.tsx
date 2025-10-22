// src/pages/onboarding/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Loader2 } from "lucide-react"; // Mail, Lock, Send, ChevronLeftアイコンを削除

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      setLoading(false);
      return;
    }

    if (!isLoginMode && password !== confirmPassword) {
      setError("パスワードが一致しません。");
      setLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        // --- ログイン処理 ---
        await signInWithEmailAndPassword(auth, email, password);
        // ログイン成功後、Homeへ遷移
        navigate("/", { replace: true });
      } else {
        // --- 新規登録処理 ---
        await createUserWithEmailAndPassword(auth, email, password);

        // 新規登録成功後、オンボーディングの最初の画面へ遷移
        navigate("/welcome", { replace: true });
      }
    } catch (err: any) {
      console.error("認証エラー:", err);
      // 認証エラーに応じたメッセージ表示
      if (err.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に使用されています。");
      } else if (
        err.code === "auth/invalid-email" ||
        err.code === "auth/weak-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("認証情報が無効です。内容を確認してください。");
      } else {
        setError("認証中に予期せぬエラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  // モード切り替え時の遷移ハンドラ
  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-12 pb-24">
      {/* 1. GETSET タイトル */}
      <h1 className="text-white text-3xl font-extrabold tracking-widest mb-10 drop-shadow-md">
        GETSET
      </h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-2xl p-6 w-full max-w-md">
        {/* 2. サブタイトル */}
        <h2 className="text-white text-xl font-bold text-center mb-6 drop-shadow-sm">
          {isLoginMode ? "ログイン" : "アカウントを作成"}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* --- メールアドレス --- */}
          <div className="relative">
            {/* 💡 アイコン削除: Mailアイコンを削除 */}
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // 💡 スタイル調整: pxを元に戻し、pyを画像に合わせ調整
              className="w-full rounded-xl border border-white/60 bg-white/90 px-4 py-3.5 text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition"
              required
            />
          </div>
          {/* --- パスワード --- */}
          <div className="relative">
            {/* 💡 アイコン削除: Lockアイコンを削除 */}
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // 💡 スタイル調整: pxを元に戻し、pyを画像に合わせ調整
              className="w-full rounded-xl border border-white/60 bg-white/90 px-4 py-3.5 text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition"
              required
            />
          </div>
          {/* --- パスワード確認用 (新規登録モードのみ) --- */}
          {!isLoginMode && (
            <div className="relative">
              {/* 💡 アイコン削除: Lockアイコンを削除 */}
              <input
                type="password"
                placeholder="パスワード確認用"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // 💡 スタイル調整: pxを元に戻し、pyを画像に合わせ調整
                className="w-full rounded-xl border border-white/60 bg-white/90 px-4 py-3.5 text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 transition"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-100 font-semibold text-center bg-red-600/60 rounded-lg p-2">
              {error}
            </p>
          )}

          {/* 3. 規約・モード切替リンク（中央寄せ） */}
          <p className="text-xs text-white/90 pt-2 text-center leading-relaxed">
            {isLoginMode ? (
              <button
                type="button"
                onClick={handleToggleMode}
                className="font-semibold underline text-white hover:text-blue-200 transition mb-2"
                disabled={loading}
              >
                新規登録はこちら
              </button>
            ) : (
              <span className="mb-2 block">
                既にアカウントをお持ちですか？{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="font-semibold underline text-white hover:text-blue-200 transition"
                  disabled={loading}
                >
                  ログイン
                </button>
              </span>
            )}
            <br className="sm:hidden" />
            登録すると、
            <a
              href="/legal/terms"
              className="text-white underline hover:text-blue-200 transition"
            >
              利用規約
            </a>
            と
            <a
              href="/legal/privacy"
              className="text-white underline hover:text-blue-200 transition"
            >
              プライバシーポリシー
            </a>
            に同意したものとみなします。
          </p>

          {/* 4. ボタン群の配置調整: 中央寄せと幅制限 */}
          <div className="pt-4 flex justify-center">
            {" "}
            {/* justify-end を justify-center に変更 */}
            {/* 送信ボタン (メインCTAとして青背景を強調) */}
            <button
              type="submit"
              // 💡 スタイル調整: w-full と mx-auto で中央配置＆幅制限を適用
              className="flex items-center justify-center w-full max-w-[200px] rounded-full bg-blue-600 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <>
                  {/* 💡 アイコン削除: Sendアイコンを削除 */}
                  {isLoginMode ? "ログイン" : "登録"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default Register;
