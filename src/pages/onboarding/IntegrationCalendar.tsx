// src/pages/onboarding/IntegrationCalendar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
// 👇 修正: CodeResponse と OnErrorResponse (またはそれに類する型) をインポート
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import axios from "axios";
import { useGoogleAuthStore } from "../../stores/useGoogleAuthStore";
import { auth, db } from "../../lib/firebase"; // Import auth and db
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

// 👇 onError のエラー型。ライブラリが詳細な型をエクスポートしていない場合があるため、
//    より一般的な Error を使うか、必要に応じて any を使う（推奨はされない）
//    ライブラリの型定義ファイル (@types/@react-oauth/google) を確認するのが最も確実
//    ここでは仮に Error 型を使用します
// import type { OnErrorResponse } from '@react-oauth/google';

const IntegrationCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useGoogleAuthStore();

  const login = useGoogleLogin({
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    accessType: "offline",
    prompt: "consent",
    // 👇 修正: codeResponse に CodeResponse 型を指定
    onSuccess: async (codeResponse: CodeResponse) => {
      try {
        // codeResponse オブジェクトから code プロパティを取得
        // (CodeResponse 型には code プロパティが含まれている)
        const { code } = codeResponse;
        console.log("✅ 認可コード取得:", code);

        const data = new URLSearchParams({
          code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_SECRET_KEY,
          redirect_uri: window.location.origin,
          grant_type: "authorization_code",
        });

        const tokenRes = await axios.post(
          "https://oauth2.googleapis.com/token",
          data.toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const { access_token, refresh_token } = tokenRes.data;
        console.log("✅ アクセストークン取得成功:", access_token);
        if (refresh_token) {
          console.log("🔑 リフレッシュトークン取得成功");
        } else {
          console.warn("⚠️ リフレッシュトークンが取得できませんでした。");
        }

        const userRes = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        setAuth(access_token, userRes.data, refresh_token);
        console.log("✅ Google連携完了:", userRes.data);

        const user = auth.currentUser;
        if (user && refresh_token) {
          try {
            const userProfileRef = doc(db, "userProfiles", user.uid);
            await setDoc(
              userProfileRef,
              { googleRefreshToken: refresh_token },
              { merge: true }
            );
            console.log("✅ Firestoreにリフレッシュトークンを保存しました。");
          } catch (firestoreError) {
            console.error(
              "❌ Firestoreへのリフレッシュトークン保存エラー:",
              firestoreError
            );
            alert(
              "連携情報の保存に失敗しました。カレンダーの自動更新ができない可能性があります。"
            );
          }
        } else if (user && !refresh_token) {
          console.warn(
            "Firestoreへのリフレッシュトークン保存スキップ: トークンがありませんでした。"
          );
        } else if (!user) {
          console.error(
            "Firestoreへのリフレッシュトークン保存失敗: Firebaseユーザーが見つかりません。"
          );
        }

        setTimeout(() => navigate("/onboarding/calendar-done"), 400);
      } catch (err: any) {
        console.error(
          "❌ Google連携エラー:",
          err.response?.data || err.message
        );
        const errorDesc = err.response?.data?.error_description || err.message;
        if (errorDesc?.includes("redirect_uri_mismatch")) {
          alert(
            "Googleカレンダー連携に失敗しました。リダイレクトURIの設定を確認してください。"
          );
        } else if (errorDesc?.includes("invalid_grant")) {
          alert("認証コードが無効、または期限切れです。再度お試しください。");
        } else {
          alert(`Googleカレンダー連携に失敗しました: ${errorDesc}`);
        }
      }
    },
    // 👇 修正: err に Error 型 (または適切な型) を指定
    onError: (err: Error) => {
      // onErrorの引数の型を Error に指定 (より具体的な型があればそれに置き換える)
      console.error("❌ Googleログインプロセスエラー:", err);
      alert(
        "Googleログインに失敗しました。ポップアップがブロックされていないか確認してください。"
      );
    },
  } as any); // 型アサーションは accessType と prompt のために残す

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
