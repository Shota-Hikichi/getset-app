// src/App.tsx
import React from "react";
// ✅ useLocation をインポート
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// --- ページコンポーネントのインポート ---
// (一般ページ)
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import ProfileSettings from "./pages/ProfileSettings"; // 一般ユーザー用
import SleepRecord from "./pages/SleepRecord";
import PointsPage from "./pages/PointsPage";
import SettingsPage from "./pages/SettingsPage"; // 一般ユーザー用設定
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactPage from "./pages/ContactPage";
import RechargeCategoryPage from "./pages/RechargeCategoryPage";
import RechargeArticleDetail from "./pages/RechargeArticleDetail";
import MyRecharges from "./pages/MyRecharges";
import RechargeSuggest from "./pages/RechargesSuggest";
// (オンボーディング)
import Welcome from "./pages/onboarding/Welcome";
import Register from "./pages/onboarding/Register";
import IntegrationCalendar from "./pages/onboarding/IntegrationCalendar";
import ProfileSetting from "./pages/onboarding/ProfileSetting"; // オンボーディング用
import ProfileDone from "./pages/onboarding/ProfileDone";
import RechargesIntro from "./pages/onboarding/RechargesIntro";
import RechargesTips from "./pages/onboarding/RechargesTips";
import RechargesPoint from "./pages/onboarding/RechargesPoint";
import RechargesDone from "./pages/onboarding/RechargesDone";
import CalendarDone from "./pages/onboarding/CalendarDone";
// (管理画面)
import AdminLayout from "./pages/admin/pages/AdminLayout";
import RechargeArticles from "./pages/admin/pages/RechargeArticles";
import RechargeManager from "./pages/admin/pages/RechargeManager";
import RechargeRuleManager from "./pages/admin/pages/RechargeRuleManager";
// (共通コンポーネント)
import Footer from "./components/Footer";

const App: React.FC = () => {
  // ✅ 現在のパスを取得
  const location = useLocation();
  // ✅ '/admin' で始まるか判定
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    // ✅ 管理画面以外の場合のみフッター分の padding-bottom (pb-16) を追加
    <div className={`min-h-screen ${!isAdminPage ? "pb-16" : ""}`}>
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
        <Route path="/recharge/suggest" element={<RechargeSuggest />} />

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

        {/* === 管理画面 (各ルートを AdminLayout で囲む) === */}
        <Route
          path="/admin/recharge-articles"
          element={
            <AdminLayout>
              {" "}
              <RechargeArticles />{" "}
            </AdminLayout>
          }
        />
        <Route
          path="/admin/recharges"
          element={
            <AdminLayout>
              {" "}
              <RechargeManager />{" "}
            </AdminLayout>
          }
        />
        <Route
          path="/admin/recharge-rules"
          element={
            <AdminLayout>
              {" "}
              <RechargeRuleManager />{" "}
            </AdminLayout>
          }
        />
        {/* 他の管理画面ルートがあればここに追加 */}

        {/* === 未定義URL === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* === フッター（管理画面 "以外" のみ表示）=== */}
      {/* ✅ isAdminPage が false の場合のみ Footer を表示 */}
      {!isAdminPage && <Footer />}
    </div>
  );
};

export default App;
