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

  // --- 更新用メソッド ---
  setField: (field: keyof ProfilePayload, value: string) => void;
  setNickname: (value: string) => void;
  setAvatar: (value: string) => void; // 🧩 ← 追加

  // --- Firestore関係 ---
  saveProfile: (userId: string) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
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
  avatar: "🙂", // 🧩 ← 追加

  // --- setter群 ---
  setField: (field, value) => set({ [field]: value } as Partial<ProfileState>),
  setNickname: (value) => set({ nickname: value }),
  setAvatar: (value) => set({ avatar: value }), // 🧩 ← 追加

  // --- Firestore保存 ---
  saveProfile: async (userId: string) => {
    try {
      const plain = pickProfilePayload(get());
      const sanitized = Object.fromEntries(
        Object.entries(plain).filter(([_, v]) => v !== undefined)
      ) as ProfilePayload;

      await setDoc(doc(db, "userProfiles", userId), sanitized, { merge: true });
      console.log("✅ Profile saved:", sanitized);
    } catch (e) {
      console.error("❌ Error saving profile:", e);
      throw e;
    }
  },

  // --- Firestore読込 ---
  loadProfile: async (userId: string) => {
    const ref = doc(db, "userProfiles", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Partial<ProfilePayload>;
      set({ ...data });
    }
  },
}));
