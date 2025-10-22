// src/stores/useGoogleAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getFunctions, httpsCallable } from "firebase/functions"; // Firebase Functions import
import { initializeApp, getApps } from "firebase/app"; // Firebase App初期化を確認するため
import { getAuth } from "firebase/auth"; // authインスタンスを取得するため

// Firebase Appが初期化されているか確認 (通常はfirebase.tsで行われているはず)
const app = getApps().length ? getApps()[0] : undefined; // Initialize if needed or get existing

// --- 👇 修正: Functionsインスタンスを取得 ---
const functionsInstance = app
  ? getFunctions(app, "asia-northeast1")
  : undefined; // Get Functions instance (リージョンを指定)
// --- 👆 修正ここまで ---

// --- Define callable function type (optional but good practice) ---
interface RefreshTokenResponse {
  accessToken: string;
}

// --- 👇 修正: functionsInstance を第一引数に渡す ---
// 関数の呼び出し可能オブジェクトを作成 (functionsInstanceが未定義の場合はnull)
const refreshGoogleTokenFunction = functionsInstance
  ? httpsCallable<void, RefreshTokenResponse>(
      functionsInstance,
      "refreshGoogleToken"
    ) // Pass functionsInstance here
  : null;
// --- 👆 修正ここまで ---

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null; // Add refresh token storage
  userInfo: any | null;
  setAuth: (
    token: string,
    info?: any,
    refreshTokenValue?: string | null
  ) => void; // refresh token param is optional and can be null
  logout: () => void;
  refreshTokenAction: () => Promise<boolean>; // Action to refresh the token
}

export const useGoogleAuthStore = create<GoogleAuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null, // Initialize refresh token
      userInfo: null,
      setAuth: (token, info, refreshTokenValue) => {
        const newState: Partial<GoogleAuthState> = {
          accessToken: token,
          userInfo: info,
        };
        // リフレッシュトークンが提供され、かつnullでない場合のみ更新
        if (refreshTokenValue !== undefined && refreshTokenValue !== null) {
          newState.refreshToken = refreshTokenValue; // Store refresh token if provided
        } else if (refreshTokenValue === null) {
          // 明示的にnullが渡されたらクリア (任意: ログアウト時などで使う想定)
          newState.refreshToken = null;
        }
        // refreshTokenValueがundefinedの場合は、既存のrefreshTokenを保持
        set(newState);
      },
      logout: () =>
        set({ accessToken: null, refreshToken: null, userInfo: null }), // Clear refresh token on logout

      // --- New action to refresh the token ---
      refreshTokenAction: async (): Promise<boolean> => {
        console.log(
          "Attempting to refresh Google access token via Cloud Function..."
        );

        // Ensure functions and the callable function are initialized
        // --- 👇 修正: functionsInstance をチェック ---
        if (!functionsInstance || !refreshGoogleTokenFunction) {
          // --- 👆 修正ここまで ---
          console.error("Firebase Functions is not initialized correctly.");
          return false;
        }
        // Ensure user is authenticated with Firebase before calling the function
        const authInstance = app ? getAuth(app) : undefined;
        if (!authInstance?.currentUser) {
          console.error(
            "Firebase Auth user not found. Cannot call refresh function."
          );
          set({ accessToken: null, refreshToken: null }); // Clear tokens if no user
          return false;
        }

        try {
          // Call the Cloud Function (no need to pass data if UID is checked server-side)
          const result = await refreshGoogleTokenFunction();
          const newAccessToken = result.data.accessToken;

          if (newAccessToken) {
            console.log(
              "Successfully refreshed Google access token via Cloud Function."
            );
            set({ accessToken: newAccessToken }); // Update the access token in the store
            return true;
          } else {
            console.error("Cloud Function did not return a new access token.");
            set({ accessToken: null, refreshToken: null }); // Clear tokens if refresh fails
            return false;
          }
        } catch (error: any) {
          console.error(
            "Error calling refreshGoogleToken Cloud Function:",
            error
          );
          // Check if the error indicates the refresh token is invalid (e.g., specific error code from function)
          if (
            error.code === "unauthenticated" ||
            error.message?.includes("invalid_grant") ||
            error.code === "functions/failed-precondition" ||
            error.code === "functions/not-found"
          ) {
            // Check for specific errors including function errors
            console.error(
              "Refresh token might be invalid or function call failed. Clearing tokens."
            );
            set({ accessToken: null, refreshToken: null }); // Clear tokens on likely invalid grant or function error
          } else {
            // Keep existing tokens for other errors? Or clear anyway?
            // Clearing might be safer to force re-login.
            console.error(
              "Unknown error during token refresh. Clearing tokens."
            );
            set({ accessToken: null, refreshToken: null });
          }
          return false;
        }
      },
    }),
    { name: "google-auth-storage" } // localStorage key
  )
);
