// src/App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase"; // Firebase AuthとFirestore

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
import RechargeSuggest from "./pages/RechargesSuggest";

// オンボーディング
import Welcome from "./pages/onboarding/Welcome";
import Register from "./pages/onboarding/Register"; // 👈 ログイン/登録画面として使用
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
import RechargeRuleManager from "./pages/admin/pages/RechargeRuleManager";
import AdminDashboard from "./pages/admin/pages/AdminDashboard";
import AdminSettings from "./pages/admin/pages/AdminSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRouteGuard from "./components/AdminRouteGuard";

// 共通
import Footer from "./components/Footer";

// ダミーコンポーネント
const AdminSettingsPlaceholder = () => (
  <div className="p-4">システム設定（コンテンツなし）</div>
);

// --- 認証状態とリダイレクトを管理するラッパー ---
interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // ユーザーがログインしている場合、オンボーディング完了状態を確認
        try {
          // FirestoreでuserProfilesドキュメントが存在するか確認
          const profileRef = doc(db, "userProfiles", user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            setOnboardingComplete(true);
          } else {
            setOnboardingComplete(false);
          }
        } catch (error) {
          console.error("オンボーディング状態の確認エラー:", error);
          setOnboardingComplete(false);
        }
      } else {
        setOnboardingComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith("/admin");

  // 1. 管理者パスは独自のガードに任せる
  if (isAdminPath) {
    return <>{children}</>;
  }

  // 2. ロード中は何も表示しない（認証状態が確定するまで待つ）
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // 3. 未認証ユーザーのリダイレクト
  if (!currentUser) {
    // ログイン/登録画面（/onboarding/register）以外ならリダイレクト
    if (currentPath !== "/onboarding/register") {
      // 👈 未認証の場合、認証入口へリダイレクト
      return <Navigate to="/onboarding/register" replace />;
    }
  }

  // 4. 認証済みだがオンボーディング未完了ユーザーのリダイレクト
  if (currentUser && !onboardingComplete) {
    // オンボーディングルート（/welcome, /onboarding/*, /onboarding/register）以外なら、リダイレクト
    if (!currentPath.startsWith("/onboarding") && currentPath !== "/welcome") {
      // 👈 Homeなど保護されたルートへアクセスしたら、オンボーディングの最初の画面へ
      // 前々回の安定版ロジックに戻します
      return <Navigate to="/welcome" replace />;
    }

    // 認証済みだがオンボーディング未完了の状態で/onboarding/registerにアクセスした場合、/welcomeへリダイレクト
    if (currentPath === "/onboarding/register") {
      return <Navigate to="/welcome" replace />;
    }
  }

  // 5. 認証済みかつオンボーディング完了ユーザーのリダイレクト
  if (currentUser && onboardingComplete) {
    // オンボーディングルート（/welcome, /onboarding/*, /onboarding/register）にアクセスしようとしたら、ホームへリダイレクト
    if (currentPath.startsWith("/onboarding") || currentPath === "/welcome") {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// --- Appコンポーネント本体 ---
const App: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen pb-16">
      {/* 認証・リダイレクト処理を最上位に配置 */}
      <AuthWrapper>
        <Routes>
          {/* === 公開・認証不要なルート（主にログイン・登録・ウェルカム） === */}

          {/* Registerがログイン/登録の統一窓口 */}
          <Route path="/onboarding/register" element={<Register />} />

          {/* Welcomeは新規登録後の最初のステップ */}
          <Route path="/welcome" element={<Welcome />} />

          {/* === オンボーディングルート (認証後、完了前) === */}
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
          <Route
            path="/onboarding/recharges/tips"
            element={<RechargesTips />}
          />
          <Route
            path="/onboarding/recharges/point"
            element={<RechargesPoint />}
          />
          <Route
            path="/onboarding/recharges/done"
            element={<RechargesDone />}
          />
          <Route path="/onboarding/calendar-done" element={<CalendarDone />} />
          <Route
            path="/onboarding/recharge-suggest"
            element={<RechargeSuggest />}
          />

          {/* === 認証が必要な一般ページ === */}
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

          {/* === 管理画面ルート (独自のAdminRouteGuardを使用) === */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/recharge-articles"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <RechargeArticles />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/recharges"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <RechargeManager />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/recharge-rules"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <RechargeRuleManager />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRouteGuard>
                <AdminLayout>
                  <AdminSettingsPlaceholder />
                </AdminLayout>
              </AdminRouteGuard>
            }
          />

          {/* === 未定義URL === */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthWrapper>

      {/* === フッター（一般ページのみ）=== */}
      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
