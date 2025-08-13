import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 一般ページ
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import ProfileSettings from "./pages/ProfileSettings"; // ← これが必須
import Footer from "./components/Footer";

// オンボーディング
import WelcomePage from "./pages/onboarding/Welcome";

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-16">
      <Routes>
        {/* 一般 */}
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/profile" element={<ProfileSettings />} />{" "}
        {/* ← これが無いと / に戻る */}
        {/* オンボーディング */}
        <Route path="/welcome" element={<WelcomePage />} />
        {/* 未定義パスはホームへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
