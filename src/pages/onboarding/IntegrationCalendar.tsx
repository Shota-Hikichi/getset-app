import React from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useGoogleAuthStore } from "../../stores/useGoogleAuthStore";

const IntegrationCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useGoogleAuthStore();

  const login = useGoogleLogin({
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    onSuccess: async (codeResponse) => {
      try {
        const { code } = codeResponse;
        console.log("✅ 認可コード取得:", code);

        // ✅ フォームデータ形式で送信（JSON禁止）
        const data = new URLSearchParams({
          code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_SECRET_KEY, // ✅ 修正済み
          redirect_uri: "http://localhost:5173",
          grant_type: "authorization_code",
        });

        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          data.toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const { access_token } = tokenRes.data;
        console.log("✅ アクセストークン取得成功:", access_token);

        // ✅ ユーザー情報を取得
        const userRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        setAuth(access_token, userRes.data);
        console.log("✅ Google連携完了:", userRes.data);

        setTimeout(() => navigate("/onboarding/calendar-done"), 400);
      } catch (err: any) {
        console.error("❌ Google連携エラー:", err.response?.data || err);
        alert("Googleカレンダー連携に失敗しました。もう一度お試しください。");
      }
    },
    onError: (err) => {
      console.error("❌ ログイン失敗:", err);
      alert("Googleログインに失敗しました。");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">カレンダー連携</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[42.8%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">3 / 7</span>
        </div>

        <p className="text-white text-sm text-center mb-6 leading-relaxed">
          Googleアカウントと連携して、予定を活用しましょう！
          <br />
          これにより、GETSETがあなたのスケジュールを自動的に読み込みます。
        </p>

        <button
          onClick={() => login()}
          className="flex items-center justify-center gap-2 bg-white text-[#444] font-medium rounded-lg px-6 py-2 w-full shadow hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
            alt="Google"
            className="w-5 h-5"
          />
          Google でログイン
        </button>

        <p className="text-xs text-white/70 mt-4 text-center">
          ※ ログイン後、自動的に次のステップに進みます
        </p>
      </div>
    </div>
  );
};

export default IntegrationCalendar;
