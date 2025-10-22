// src/stores/useGoogleAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = getApps().length ? getApps()[0] : undefined;
const functionsInstance = app
  ? getFunctions(app, "asia-northeast1")
  : undefined;

interface RefreshTokenResponse {
  accessToken: string;
}

const refreshGoogleTokenFunction = functionsInstance
  ? httpsCallable<void, RefreshTokenResponse>(
      functionsInstance,
      "refreshGoogleToken"
    )
  : null;

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null; // リフレッシュトークン
  userInfo: any | null;
  setAuth: (
    token: string,
    info?: any,
    refreshTokenValue?: string | null
  ) => void;
  logout: () => void; // 👈 これはアクセストークンのみクリア
  clearAllAuth: () => void; // 👈 リフレッシュトークンも含めて全てクリア
  refreshTokenAction: () => Promise<boolean>;
}

export const useGoogleAuthStore = create<GoogleAuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      setAuth: (token, info, refreshTokenValue) => {
        const newState: Partial<GoogleAuthState> = {
          accessToken: token,
          userInfo: info,
        };
        if (refreshTokenValue !== undefined && refreshTokenValue !== null) {
          newState.refreshToken = refreshTokenValue;
        } else if (refreshTokenValue === null) {
          newState.refreshToken = null;
        }
        set(newState);
      },

      // --- 👇 修正: ログアウトはアクセストークンとユーザー情報のみクリア ---
      // (リフレッシュトークンは永続化のため保持)
      logout: () => set({ accessToken: null, userInfo: null }),
      // --- 👆 修正ここまで ---

      // --- 👇 追加: アカウント削除時に全てをクリアするアクション ---
      clearAllAuth: () =>
        set({ accessToken: null, refreshToken: null, userInfo: null }),
      // --- 👆 追加ここまで ---

      refreshTokenAction: async (): Promise<boolean> => {
        console.log(
          "Attempting to refresh Google access token via Cloud Function..."
        );

        // --- 👇 修正: リフレッシュトークンをストアから取得 ---
        const { refreshToken } = get();
        if (!refreshToken) {
          console.error("No refresh token found in store. Cannot refresh.");
          // リフレッシュトークンが無い場合はクリア (再ログイン/再連携が必要)
          set({ accessToken: null, refreshToken: null, userInfo: null });
          return false;
        }
        // --- 👆 修正ここまで ---

        if (!functionsInstance || !refreshGoogleTokenFunction) {
          console.error("Firebase Functions is not initialized correctly.");
          return false;
        }

        const authInstance = app ? getAuth(app) : undefined;
        if (!authInstance?.currentUser) {
          console.error(
            "Firebase Auth user not found. Cannot call refresh function."
          );
          set({ accessToken: null }); // accessTokenだけクリア
          return false;
        }

        try {
          // Cloud Functions 呼び出し (v2ではリフレッシュトークンを引数で渡す必要はない)
          // サーバー側 (index.ts) で Firestore から refreshToken を取得するため
          const result = await refreshGoogleTokenFunction();
          const newAccessToken = result.data.accessToken;

          if (newAccessToken) {
            console.log(
              "Successfully refreshed Google access token via Cloud Function."
            );
            set({ accessToken: newAccessToken });
            return true;
          } else {
            console.error("Cloud Function did not return a new access token.");
            set({ accessToken: null, refreshToken: null }); // 失敗時はクリア
            return false;
          }
        } catch (error: any) {
          console.error(
            "Error calling refreshGoogleToken Cloud Function:",
            error
          );
          if (
            error.code === "unauthenticated" ||
            error.message?.includes("invalid_grant") ||
            error.code === "functions/failed-precondition" ||
            error.code === "functions/not-found" ||
            error.code === "unauthenticated"
          ) {
            console.error(
              "Refresh token might be invalid or function call failed. Clearing tokens."
            );
            set({ accessToken: null, refreshToken: null, userInfo: null }); // 失敗時はすべてクリア
          } else {
            console.error(
              "Unknown error during token refresh. Clearing access token."
            );
            set({ accessToken: null }); // 不明なエラーはアクセストークンのみクリア
          }
          return false;
        }
      },
    }),
    { name: "google-auth-storage" } // localStorage key
  )
);
