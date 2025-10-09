import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GoogleAuthState {
  accessToken: string | null;
  userInfo: any | null;
  setAuth: (token: string, info?: any) => void;
  logout: () => void;
}

export const useGoogleAuthStore = create<GoogleAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userInfo: null,
      setAuth: (token, info) => set({ accessToken: token, userInfo: info }),
      logout: () => set({ accessToken: null, userInfo: null }),
    }),
    { name: "google-auth-storage" } // localStorage key
  )
);
