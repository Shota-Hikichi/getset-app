// src/stores/useProfileStore.ts
import { create } from "zustand";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface ProfileState {
  // --- Firestoreに保存する基本プロフィール ---
  nickname: string;
  age: string;
  gender: string;
  industry: string;
  jobType: string;
  income: string;
  position: string;
  prefecture: string;
  avatar: string; // 🧩 ← 追加（絵文字・URLなど）

  // --- 👇 修正: アプリ内状態を追加 ---
  onboardingComplete: boolean | null; // 読み込み中は null
  // --- 👆 修正ここまで ---

  // --- 更新用メソッド ---
  setField: (field: keyof ProfilePayload, value: string) => void;
  setNickname: (value: string) => void;
  setAvatar: (value: string) => void; // 🧩 ← 追加
  // --- 👇 修正: アプリ内状態のセッターを追加 ---
  setOnboardingComplete: (status: boolean | null) => void; // null許容に変更
  // --- 👆 修正ここまで ---

  // --- Firestore関係 ---
  saveProfile: (userId: string) => Promise<void>;
  loadProfile: (userId: string, checkOnboardingOnly?: boolean) => Promise<void>; // 👈 オプション追加
}

// Firestoreへ保存する値だけ
export type ProfilePayload = Pick<
  ProfileState,
  | "nickname"
  | "age"
  | "gender"
  | "industry"
  | "jobType"
  | "income"
  | "position"
  | "prefecture"
  | "avatar" // 🧩 ← 追加
>;

const pickProfilePayload = (s: ProfileState): ProfilePayload => ({
  nickname: s.nickname ?? "",
  age: s.age ?? "",
  gender: s.gender ?? "",
  industry: s.industry ?? "",
  jobType: s.jobType ?? "",
  income: s.income ?? "",
  position: s.position ?? "",
  prefecture: s.prefecture ?? "",
  avatar: s.avatar ?? "🙂", // ← 初期値を入れておくと安心
});

export const useProfileStore = create<ProfileState>((set, get) => ({
  // --- 初期値 ---
  nickname: "",
  age: "",
  gender: "",
  industry: "",
  jobType: "",
  income: "",
  position: "",
  prefecture: "",
  avatar: "🙂",
  onboardingComplete: null, // 読み込み中は null

  // --- setter群 ---
  setField: (field, value) => set({ [field]: value } as Partial<ProfileState>),
  setNickname: (value) => set({ nickname: value }),
  setAvatar: (value) => set({ avatar: value }),
  setOnboardingComplete: (status) => set({ onboardingComplete: status }), // 👈 修正

  // --- Firestore保存 ---
  saveProfile: async (userId: string) => {
    try {
      const plain = pickProfilePayload(get());
      const sanitized = Object.fromEntries(
        Object.entries(plain).filter(([_, v]) => v !== undefined)
      ) as ProfilePayload;

      // saveProfile 時に onboarded: true も書き込む (ProfileSetting.tsx からの呼び出しを想定)
      await setDoc(
        doc(db, "userProfiles", userId),
        { ...sanitized, onboarded: true, updatedAt: new Date().toISOString() }, // onboarded: true を追加
        { merge: true }
      );
      console.log("✅ Profile saved (and onboarded set to true):", sanitized);
      set({ onboardingComplete: true }); // ストアの状態も更新
    } catch (e) {
      console.error("❌ Error saving profile:", e);
      throw e;
    }
  },

  // --- Firestore読込 ---
  loadProfile: async (userId: string, checkOnboardingOnly = false) => {
    const ref = doc(db, "userProfiles", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Partial<
        ProfilePayload & { onboarded: boolean }
      >;
      if (checkOnboardingOnly) {
        // AuthWrapper用の軽量ロード: オンボーディング状態のみ更新
        set({ onboardingComplete: data.onboarded === true });
      } else {
        // MyPage/ProfileSettings用のフルロード: 全てのプロフィール情報を更新
        set({ ...data, onboardingComplete: data.onboarded === true });
      }
    } else {
      // ドキュメントが存在しない = オンボーディング未完了
      set({ onboardingComplete: false });
    }
  },
}));
