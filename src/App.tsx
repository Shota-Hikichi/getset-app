// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 一般ページ
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import ProfileSettings from "./pages/ProfileSettings";

// オンボーディングYES
import Welcome from "./pages/onboarding/Welcome";
import Register from "./pages/onboarding/Register";
import IntegrationCalendar from "./pages/onboarding/IntegrationCalendar";
import ProfileSetting from "./pages/onboarding/ProfileSetting";
import ProfileDone from "./pages/onboarding/ProfileDone";
import RechargesIntro from "./pages/onboarding/RechargesIntro";
import RechargesTips from "./pages/onboarding/RechargesTips";
import RechargesPoint from "./pages/onboarding/RechargesPoint";
import RechargesDone from "./pages/onboarding/RechargesDone";
import CalendarDone from "./pages/onboarding/CalendarDone";

import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-16">
      <Routes>
        {/* === 一般 === */}
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/profile" element={<ProfileSettings />} />
        {/* === オンボーディング === */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding/welcome" element={<Welcome />} />{" "}
        {/* 任意のエイリアス */}
        <Route path="/onboarding/register" element={<Register />} />
        <Route path="/register" element={<Register />} />{" "}
        {/* 互換用エイリアス */}
        <Route
          path="/onboarding/integration-calendar"
          element={<IntegrationCalendar />}
        />
        <Route
          path="/onboarding/profile-setting"
          element={<ProfileSetting />}
        />
        <Route path="/onboarding/profile-done" element={<ProfileDone />} />
        <Route
          path="/onboarding/recharges/intro"
          element={<RechargesIntro />}
        />
        <Route path="/onboarding/recharges/tips" element={<RechargesTips />} />
        <Route
          path="/onboarding/recharges/point"
          element={<RechargesPoint />}
        />
        <Route path="/onboarding/recharges/done" element={<RechargesDone />} />
        <Route path="/onboarding/calendar-done" element={<CalendarDone />} />
        {/* === 未定義はホームへ === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 全ページ共通フッター（下タブ） */}
      <Footer />
    </div>
  );
};

export default App;
