// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 一般ページ
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import ProfileSettings from "./pages/ProfileSettings";
import SleepRecord from "./pages/SleepRecord";
import PointsPage from "./pages/PointsPage";
import SettingsPage from "./pages/SettingsPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactPage from "./pages/ContactPage";
import RechargeCategoryPage from "./pages/RechargeCategoryPage";
import RechargeArticleDetail from "./pages/RechargeArticleDetail";
import MyRecharges from "./pages/MyRecharges";

// オンボーディング
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

// 管理画面
import AdminLayout from "./pages/admin/pages/AdminLayout";
import RechargeArticles from "./pages/admin/pages/RechargeArticles";
import RechargeManager from "./pages/admin/pages/RechargeManager";

// 共通
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-16">
      <Routes>
        {/* === 一般ページ === */}
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/recharge" element={<RechargePage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/profile" element={<ProfileSettings />} />
        <Route path="/mypage/sleep" element={<SleepRecord />} />
        <Route path="/mypage/points" element={<PointsPage />} />
        <Route path="/mypage/settings" element={<SettingsPage />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/mypage/contact" element={<ContactPage />} />
        <Route
          path="/recharge/:categoryId"
          element={<RechargeCategoryPage />}
        />
        <Route
          path="/recharge/article/:id"
          element={<RechargeArticleDetail />}
        />
        <Route path="/mypage/recharges" element={<MyRecharges />} />

        {/* === オンボーディング === */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding/register" element={<Register />} />
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

        {/* === 管理画面 === */}
        <Route
          path="/admin/recharge-articles"
          element={
            <AdminLayout>
              <RechargeArticles />
            </AdminLayout>
          }
        />
        <Route path="/admin/recharges" element={<RechargeManager />} />

        {/* === 未定義URL === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* === フッター（一般ページのみ）=== */}
      <Footer />
    </div>
  );
};

export default App;
