// src/stores/useGoogleAuthStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getFunctions, httpsCallable } from "firebase/functions";
// ✅ 中央の app と auth インスタンスを使用
import { app, auth } from "../lib/firebase";

// 💡 Functions インスタンスを確実に初期化
// 'asia-northeast1' リージョンを明示的に指定し、正しいエンドポイントを参照するように強制
const functionsInstance = getFunctions(app, "asia-northeast1");

interface RefreshTokenResponse {
  accessToken: string;
}

const refreshGoogleTokenFunction = httpsCallable<void, RefreshTokenResponse>(
  functionsInstance,
  "refreshGoogleToken"
);

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: any | null;
  setAuth: (
    token: string,
    info?: any,
    refreshTokenValue?: string | null
  ) => void;
  logout: () => void;
  clearAllAuth: () => void;
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

      logout: () => set({ accessToken: null, userInfo: null }),

      clearAllAuth: () =>
        set({ accessToken: null, refreshToken: null, userInfo: null }),

      refreshTokenAction: async (): Promise<boolean> => {
        console.log(
          "Attempting to refresh Google access token via Cloud Function..."
        );

        const { refreshToken } = get();
        if (!refreshToken) {
          console.error("No refresh token found in store. Cannot refresh.");
          set({ accessToken: null, refreshToken: null, userInfo: null });
          return false;
        }

        if (!refreshGoogleTokenFunction) {
          console.error("Firebase Functions callable is not available.");
          return false;
        }

        if (!auth.currentUser) {
          console.error(
            "Firebase Auth user not found. Cannot call refresh function."
          );
          set({ accessToken: null });
          return false;
        }

        try {
          // 💡 httpsCallable を使用。この呼び出しに成功すればCORSの問題は解消
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
            set({ accessToken: null, refreshToken: null });
            return false;
          }
        } catch (error: any) {
          console.error(
            "Error calling refreshGoogleToken Cloud Function:",
            error
          );

          const errorMsg = error.message || "";
          if (
            error.code === "unauthenticated" ||
            errorMsg.includes("invalid_grant") ||
            error.code === "functions/failed-precondition" ||
            error.code === "functions/not-found"
          ) {
            console.error(
              "Refresh token might be invalid or function call failed. Clearing tokens."
            );
            set({ accessToken: null, refreshToken: null, userInfo: null });
          } else {
            console.error(
              "Unknown error during token refresh. Clearing access token."
            );
            set({ accessToken: null });
          }
          return false;
        }
      },
    }),
    { name: "google-auth-storage" }
  )
);
