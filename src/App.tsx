// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// 👇 修正: onSnapshot をインポート
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore"; // getDoc は初期ロード用に残す
import { auth, db } from "./lib/firebase";
import axios from "axios";

import { fetchGoogleCalendarEvents } from "./services/calendarService";
import { useCalendarStore } from "./stores/useCalendarStore";
import { useGoogleAuthStore } from "./stores/useGoogleAuthStore";

// --- ページコンポーネントのインポート (変更なし) ---
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
// ... (他のページのインポートは省略) ...
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import Footer from "./components/Footer";
import Register from "./pages/onboarding/Register";
import Welcome from "./pages/onboarding/Welcome";
import IntegrationCalendar from "./pages/onboarding/IntegrationCalendar";
import ProfileSetting from "./pages/onboarding/ProfileSetting";
import ProfileDone from "./pages/onboarding/ProfileDone";
import RechargesIntro from "./pages/onboarding/RechargesIntro";
import RechargesTips from "./pages/onboarding/RechargesTips";
import RechargesPoint from "./pages/onboarding/RechargesPoint";
import RechargesDone from "./pages/onboarding/RechargesDone";
import CalendarDone from "./pages/onboarding/CalendarDone";
import RechargeSuggest from "./pages/RechargesSuggest";
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
import AdminLayout from "./pages/admin/pages/AdminLayout";
import RechargeArticles from "./pages/admin/pages/RechargeArticles";
import RechargeManager from "./pages/admin/pages/RechargeManager";
import RechargeRuleManager from "./pages/admin/pages/RechargeRuleManager";
import AdminDashboard from "./pages/admin/pages/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRouteGuard from "./components/AdminRouteGuard";

const AdminSettingsPlaceholder = () => (
  <div className="p-4">システム設定（コンテンツなし）</div>
);

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true); // Firebase Auth のローディング
  const [profileLoading, setProfileLoading] = useState(true); // Firestore のローディング
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  );
  const location = useLocation();

  const setCalendarEvents = useCalendarStore((state) => state.setEvents);
  const setCalendarLoading = useCalendarStore((state) => state.setLoading);
  const setCalendarError = useCalendarStore((state) => state.setError);
  const clearCalendarEvents = useCalendarStore((state) => state.clearEvents);
  const accessToken = useGoogleAuthStore((state) => state.accessToken);
  const logoutGoogle = useGoogleAuthStore((state) => state.logout);
  const refreshTokenAction = useGoogleAuthStore(
    (state) => state.refreshTokenAction
  );
  const isLoadingCalendar = useCalendarStore((state) => state.isLoading);

  const loadCalendar = useCallback(
    async (token: string, isRetry = false) => {
      if (useCalendarStore.getState().isLoading) {
        console.log("AuthWrapper: Skipping calendar fetch (already loading).");
        return;
      }
      setCalendarLoading(true);
      setCalendarError(null);
      try {
        console.log(
          `AuthWrapper: Fetching calendar events... (Attempt ${
            isRetry ? 2 : 1
          })`
        );
        const events = await fetchGoogleCalendarEvents(token);
        setCalendarEvents(events);
        console.log(
          "AuthWrapper: Calendar events fetched successfully:",
          events.length,
          "events"
        );
      } catch (calendarError: any) {
        console.error(
          "AuthWrapper: Failed to fetch calendar events:",
          calendarError
        );
        if (
          axios.isAxiosError(calendarError) &&
          calendarError.response?.status === 401
        ) {
          console.warn(
            "AuthWrapper: Google Access Token is invalid or expired."
          );
          if (!isRetry) {
            console.log("AuthWrapper: Attempting token refresh...");
            if (!useCalendarStore.getState().isLoading) {
              const refreshed = await refreshTokenAction();
              if (refreshed) {
                const newToken = useGoogleAuthStore.getState().accessToken;
                if (newToken) {
                  console.log(
                    "AuthWrapper: Retrying calendar fetch with new token..."
                  );
                  setTimeout(() => loadCalendar(newToken, true), 50);
                  return;
                } else {
                  console.error(
                    "AuthWrapper: Refresh successful but no new token found."
                  );
                  setCalendarError(
                    "トークンの更新に失敗しました。再ログインしてください。"
                  );
                  logoutGoogle();
                  setCalendarLoading(false);
                }
              } else {
                console.error("AuthWrapper: Token refresh failed.");
                setCalendarError(
                  "Google連携の認証情報が無効です。再連携または再ログインしてください。"
                );
                logoutGoogle();
                setCalendarLoading(false);
              }
            } else {
              console.log("AuthWrapper: Refresh already in progress?");
              setCalendarLoading(false);
            }
          } else {
            console.error(
              "AuthWrapper: Calendar fetch failed even after token refresh."
            );
            setCalendarError(
              "カレンダーの再取得に失敗しました。再ログインしてください。"
            );
            logoutGoogle();
            setCalendarLoading(false);
          }
        } else {
          setCalendarError("カレンダーの読み込み中にエラーが発生しました。");
          setCalendarLoading(false);
        }
      }
    },
    [
      setCalendarLoading,
      setCalendarEvents,
      setCalendarError,
      logoutGoogle,
      refreshTokenAction,
    ]
  );

  // --- 👇 修正: 認証状態の監視とプロフィール監視を分離 ---

  // 1. Firebase Auth の認証状態を監視する useEffect
  useEffect(() => {
    setAuthLoading(true); // 認証チェック開始
    setOnboardingComplete(null); // ユーザーが変わる可能性があるのでリセット
    clearCalendarEvents(); // ユーザーが変わるのでカレンダーもクリア

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false); // 認証チェック完了
      if (!user) {
        // ログアウトした場合
        setOnboardingComplete(false); // 未完了状態にする
        logoutGoogle(); // Googleセッションもクリア
        setProfileLoading(false); // プロフィールロードも不要なので完了
      }
      // ユーザーがいる場合は、下の useEffect でプロフィール監視を開始
    });
    return () => unsubscribeAuth();
  }, [clearCalendarEvents, logoutGoogle]); // 依存配列は初回のみ

  // 2. 認証済みユーザーのプロフィール (onboarded 状態) を Firestore で監視する useEffect
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined; // リスナー解除用の関数

    if (currentUser) {
      setProfileLoading(true); // プロフィール監視開始
      const profileRef = doc(db, "userProfiles", currentUser.uid);

      unsubscribeProfile = onSnapshot(
        profileRef,
        (profileSnap) => {
          const profileData = profileSnap.data();
          const isComplete =
            profileSnap.exists() && profileData?.onboarded === true;
          setOnboardingComplete(isComplete); // リアルタイムで更新
          setProfileLoading(false); // プロフィール状態確定
          console.log(
            `AuthWrapper (onSnapshot): User ${
              currentUser.uid
            }, Onboarding complete update: ${isComplete} (Doc exists: ${profileSnap.exists()}, onboarded field: ${
              profileData?.onboarded
            })`
          );
        },
        (error) => {
          console.error("Firestoreプロファイル監視エラー:", error);
          setOnboardingComplete(false); // エラー時は未完了扱い
          setProfileLoading(false);
          setCalendarError("ユーザー情報の読み込みに失敗しました。");
        }
      );
    } else {
      // ユーザーがいない場合は監視不要
      setProfileLoading(false); // ローディング完了
    }

    // クリーンアップ関数: コンポーネントのアンマウント時や currentUser が変わった時にリスナーを解除
    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        console.log("AuthWrapper: Firestore listener unsubscribed.");
      }
    };
  }, [currentUser, setCalendarError]); // currentUser が変わったら再購読

  // --- 👆 修正ここまで ---

  // --- カレンダー読み込み useEffect (変更なし、依存配列注意) ---
  useEffect(() => {
    if (onboardingComplete === true && accessToken) {
      const { isLoading, error } = useCalendarStore.getState();
      if (!isLoading && !error) {
        loadCalendar(accessToken);
      } else {
        console.log(
          "AuthWrapper: Skipping calendar load (already loading/error)."
        );
      }
    }
    // loadCalendar は useCallback でメモ化されているので依存配列に入れても無限ループしないはず
  }, [onboardingComplete, accessToken, loadCalendar]);

  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith("/admin");

  // --- Render logic (ローディング条件を修正) ---
  if (isAdminPath) return <>{children}</>;
  // 認証チェックとプロフィールチェックの両方が完了するまでローディング
  if (authLoading || profileLoading || onboardingComplete === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // --- リダイレクトロジック (変更なし) ---
  if (!currentUser) {
    if (currentPath !== "/onboarding/register")
      return <Navigate to="/onboarding/register" replace />;
  }
  if (currentUser && !onboardingComplete) {
    if (!currentPath.startsWith("/onboarding") && currentPath !== "/welcome")
      return <Navigate to="/welcome" replace />;
    if (currentPath === "/onboarding/register")
      return <Navigate to="/welcome" replace />;
  }
  if (currentUser && onboardingComplete) {
    if (currentPath.startsWith("/onboarding") || currentPath === "/welcome")
      return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// --- Appコンポーネント本体 (変更なし) ---
const App: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen pb-16">
      <AuthWrapper>
        <Routes>
          {/* Routes remain the same */}
          {/* === 公開・認証不要なルート === */}
          <Route path="/onboarding/register" element={<Register />} />
          <Route path="/welcome" element={<Welcome />} />

          {/* === オンボーディングルート === */}
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

          {/* === 管理画面ルート === */}
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

      {/* === フッター === */}
      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
