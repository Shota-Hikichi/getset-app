import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useGoogleAuthStore } from "../../stores/useGoogleAuthStore";

const IntegrationCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { accessToken, setAuth } = useGoogleAuthStore();

  // ✅ すでにログイン済みならスキップ
  useEffect(() => {
    if (accessToken) {
      console.log("🔁 すでにGoogle連携済み → 次の画面へスキップ");
      navigate("/onboarding/calendar-done");
    }
  }, [accessToken, navigate]);

  // ✅ Googleログイン（auth-codeフロー）＋Calendarスコープ対応
  const login = useGoogleLogin({
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    // promptは型定義上存在しないが実際は有効なので型回避
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    prompt: "consent",
    onSuccess: async (codeResponse: { code: string }) => {
      try {
        console.log("✅ 認可コード取得:", codeResponse.code);

        // 🔁 認可コードをアクセストークン＋リフレッシュトークンに交換
        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          {
            code: codeResponse.code,
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
            redirect_uri: "postmessage",
            grant_type: "authorization_code",
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token, scope } = tokenRes.data;
        console.log("✅ 発行スコープ:", scope);

        // 🎯 ユーザー情報を取得
        const userRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        // 🧠 Zustandに保存（永続化あり）
        setAuth(access_token, {
          ...userRes.data,
          refresh_token, // 更新用にも保持
        });

        console.log("✅ Google連携完了:", userRes.data);

        // ✅ 遷移
        setTimeout(() => navigate("/onboarding/calendar-done"), 400);
      } catch (error: any) {
        console.error("❌ Google連携エラー:", error.response?.data || error);
      }
    },
    onError: (err) => console.error("❌ ログイン失敗:", err),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">カレンダー連携</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        {/* 進捗バー */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-5 w-[42.8%] bg-white rounded-full transition-all duration-300"></div>
          </div>
          <span className="text-white mt-2 font-semibold">3 / 7</span>
        </div>

        <p className="text-white text-sm text-center mb-6">
          Googleアカウントと連携して、予定を活用しましょう！
        </p>

        {/* ログインボタン */}
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
      </div>
    </div>
  );
};

export default IntegrationCalendar;
