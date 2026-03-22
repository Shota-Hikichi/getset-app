// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  // 👈 修正: signOutをインポート
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
// 👈 修正: Loader2をlucide-reactからインポート
import { Mail, Lock, UserPlus, Send, Loader2 } from "lucide-react";
import { auth } from "../lib/firebase";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ログイン成功: AuthWrapperでリダイレクト処理が行われるため、ここでは何もしない
    } catch (err: any) {
      console.error("ログインエラー:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("メールアドレスまたはパスワードが正しくありません。");
      } else {
        setError("ログイン中にエラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(
        "パスワードをリセットするには、メールアドレスを入力してください。"
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("パスワード再設定メールを送信しました。ご確認ください。");
      setError("");
    } catch (err) {
      setError("パスワード再設定メールの送信に失敗しました。");
    }
  };

  // 👈 新規登録ボタンのハンドラ
  const handleNavigateToWelcome = async () => {
    // 新規登録フローに入る前に、既存のログインセッションを強制的にログアウトさせる
    try {
      await signOut(auth);
      // ローカルデータがあればクリアする処理もここに追加可能
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
    // ログアウトが完了してから /welcome へ遷移
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center justify-center px-4 pt-8">
      <h1 className="text-white text-3xl font-bold mb-8">GETSET ログイン</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center bg-white/80 rounded-xl p-3">
            <Mail className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-gray-800 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center bg-white/80 rounded-xl p-3">
            <Lock className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-gray-800 focus:outline-none"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-semibold pt-2">{error}</p>
          )}
          {resetMessage && (
            <p className="text-sm text-green-600 font-semibold pt-2">
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-600 font-semibold py-3 rounded-full shadow hover:bg-blue-100 transition disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              "ログイン"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-white text-sm">
          <button
            onClick={handlePasswordReset}
            className="underline hover:text-blue-200 transition"
          >
            パスワードをお忘れですか？
          </button>
          <div className="flex items-center justify-center pt-2">
            <p className="mr-2">アカウントをお持ちでない場合:</p>
            <button
              onClick={handleNavigateToWelcome}
              className="flex items-center underline font-semibold hover:text-blue-200 transition"
            >
              <UserPlus className="w-4 h-4 mr-1" /> 新規登録へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
