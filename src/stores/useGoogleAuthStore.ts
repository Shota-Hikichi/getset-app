// src/stores/useGoogleAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface GoogleAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: any | null;
  setAuth: (token: string, info?: any, refreshTokenValue?: string | null) => void;
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
        const newState: Partial<GoogleAuthState> = { accessToken: token, userInfo: info };
        if (refreshTokenValue !== undefined && refreshTokenValue !== null) {
          newState.refreshToken = refreshTokenValue;
        } else if (refreshTokenValue === null) {
          newState.refreshToken = null;
        }
        set(newState);
      },

      logout: () => set({ accessToken: null, userInfo: null }),
      clearAllAuth: () => set({ accessToken: null, refreshToken: null, userInfo: null }),

      // Google のトークンエンドポイントを直接呼び出してアクセストークンを更新
      refreshTokenAction: async (): Promise<boolean> => {
        console.log("Refreshing Google access token directly...");

        const { refreshToken } = get();
        if (!refreshToken) {
          console.error("No refresh token stored.");
          set({ accessToken: null, refreshToken: null, userInfo: null });
          return false;
        }

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
        const clientSecret = import.meta.env.VITE_SECRET_KEY as string;

        if (!clientId || !clientSecret) {
          console.error("Missing VITE_GOOGLE_CLIENT_ID or VITE_SECRET_KEY in .env");
          return false;
        }

        try {
          const response = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: refreshToken,
              grant_type: "refresh_token",
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("Token refresh failed:", data);
            if (data.error === "invalid_grant") {
              // リフレッシュトークン自体が無効 → 再ログインが必要
              set({ accessToken: null, refreshToken: null, userInfo: null });
            } else {
              set({ accessToken: null });
            }
            return false;
          }

          if (data.access_token) {
            console.log("Google access token refreshed successfully.");
            set({ accessToken: data.access_token });
            return true;
          }

          console.error("No access_token in response:", data);
          set({ accessToken: null });
          return false;
        } catch (err) {
          console.error("Network error during token refresh:", err);
          set({ accessToken: null });
          return false;
        }
      },
    }),
    { name: "google-auth-storage" }
  )
);
