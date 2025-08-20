import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";

const IntegrationCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const accessToken = credentialResponse.credential;

      // ユーザー情報の取得（オプション）
      const res = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUserInfo(res.data);

      // Google Calendar API 呼び出しの例（カレンダーリスト取得）
      const calendarRes = await axios.get(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("連携成功！カレンダーリスト:", calendarRes.data);

      // 成功後に次の画面に遷移
      navigate("/calendar_done");
    } catch (error) {
      console.error("Googleカレンダー連携エラー:", error);
    }
    navigate("/onboarding/calendar-done");
  };

  const handleError = () => {
    console.error("Googleログインに失敗しました");
  };

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

        <div className="flex justify-center mb-6">
          <img
            src="/assets/calendar-illustration.jpg"
            alt="Calendar Illustration"
            className="w-[180px] h-auto"
          />
        </div>

        <p className="text-white text-sm text-center mb-6">
          Googleアカウントと連携して、予定を活用しましょう！
        </p>

        <div className="flex flex-col gap-4 items-center">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
};

export default IntegrationCalendar;
