// src/stores/useRechargesStore.ts
import { create, StateCreator } from "zustand";
// 👇 修正: Firestoreの書き込み・監視用の関数をインポート
import { db, auth } from "../lib/firebase"; // auth もインポート
import {
  collection,
  getDocs,
  query,
  where,
  addDoc, // 👈 追加
  deleteDoc, // 👈 追加
  doc, // 👈 追加
  onSnapshot, // 👈 追加
  Unsubscribe, // 👈 追加
} from "firebase/firestore";

// 型定義をインポート
import type { RechargeAction } from "../types/recharge";
import type { RechargeRule } from "../types/rechargeRule";
import { useTimeSettingsStore, isTimeBlocked } from "./useTimeSettingsStore";

// ヘルパー関数 (変更なし)
function getDayType(date: Date): "workday" | "holiday" {
  const day = date.getDay();
  return day === 0 || day === 6 ? "holiday" : "workday";
}
function getCurrentTimeZone(): "morning" | "during" | "after" {
  const hour = new Date().getHours();
  if (hour < 9) return "morning";
  if (hour >= 9 && hour < 18) return "during";
  return "after";
}

// "15:00〜17:00" や "15:00-17:00" 形式の文字列を解析して現在時刻が範囲内か判定
function isWithinRecommendedTime(range: string | undefined): boolean {
  if (!range || range.trim() === "") return true; // 未設定なら時間制限なし
  const match = range.match(/(\d{1,2}):(\d{2})[〜~\-–](\d{1,2}):(\d{2})/);
  if (!match) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
  const endMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * ストアで管理するスロットの型 (変更なし)
 */
export interface RechargeSlot {
  id: string; // FirestoreドキュメントID
  start: string;
  end: string;
  category: string;
  label?: string;
  intensity?: number | null;
  actions?: string[];
}

/**
 * ストア全体の型定義 (修正あり)
 */
export interface RechargeStoreState {
  // === 状態 (State) ===
  slots: RechargeSlot[]; // ユーザー個人のスロット (Firestoreと同期)
  allRecharges: RechargeAction[];
  rechargeRules: RechargeRule[];
  timeZone: "morning" | "during" | "after";
  // 👇 修正: Firestoreリスナー解除用の関数を追加
  unsubscribeUserRecharges: Unsubscribe | null;

  // === セレクタ (Selectors / Getters) ===
  getActiveRule: () => RechargeRule | null;
  getFilteredRecharges: () => RechargeAction[];
  getValidSlots: () => RechargeSlot[];

  // === アクション (Actions) ===
  fetchData: () => Promise<void>; // これは公開データ用 (Adminが登録したもの)
  setTimeZone: (zone: "morning" | "during" | "after") => void;

  // 👇 修正: Firestore連携アクション
  addSlot: (slot: Omit<RechargeSlot, "id">) => Promise<void>; // 非同期に変更
  removeRecharge: (id: string) => Promise<void>; // 非同期に変更
  initUserRechargesListener: (uid: string) => void; // 👈 ユーザーログイン時に呼ぶ
  clearUserRechargesListener: () => void; // 👈 ユーザーログアウト時に呼ぶ
}

const rechargeStoreCreator: StateCreator<RechargeStoreState> = (set, get) => ({
  slots: [],
  allRecharges: [],
  rechargeRules: [],
  timeZone: getCurrentTimeZone(),
  unsubscribeUserRecharges: null, // 👈 初期値

  // --- Selectors (変更なし) ---
  getActiveRule: () => {
    // ... (既存のコード) ...
    const { rechargeRules, timeZone } = get();
    if (rechargeRules.length === 0) {
      return null;
    }
    const now = new Date();
    const currentDayType = getDayType(now);
    const matchingRules = rechargeRules.filter(
      (rule) =>
        rule.dayType === currentDayType &&
        rule.timeZone === timeZone &&
        rule.active
    );
    if (matchingRules.length === 0) return null;
    const bestRule = matchingRules.sort((a, b) => b.priority - a.priority)[0];
    return bestRule;
  },
  getFilteredRecharges: () => {
    // ... (既存のコード) ...
    const { allRecharges } = get();
    const activeRule = get().getActiveRule();
    if (!activeRule || allRecharges.length === 0) {
      return [];
    }

    // 現在時刻がブロック時間帯かチェック
    const timeSettings = useTimeSettingsStore.getState();
    const currentHour = new Date().getHours();
    if (isTimeBlocked(timeSettings, currentHour)) {
      return [];
    }
    let candidates = allRecharges.filter((recharge: any) => {
      const duration = parseInt(recharge.duration, 10) || 0;
      const recovery = recharge.recovery;
      const categoryMatch =
        !activeRule.categories ||
        activeRule.categories.length === 0 ||
        (recharge.category &&
          activeRule.categories?.includes(recharge.category.trim()));
      const durationMatch =
        duration >= (activeRule.minDuration ?? 0) &&
        duration <= (activeRule.maxDuration ?? Infinity);
      const recoveryMatch =
        recovery >= (activeRule.minRecovery ?? 0) &&
        recovery <= (activeRule.maxRecovery ?? Infinity);
      const timeMatch = isWithinRecommendedTime((recharge as any).recommendedTimeRange);
      return categoryMatch && durationMatch && recoveryMatch && timeMatch;
    });
    if (activeRule.sortBy && activeRule.sortOrder) {
      candidates.sort((a, b) => {
        const key = activeRule.sortBy!;
        const order = activeRule.sortOrder === "asc" ? 1 : -1;
        const valA =
          key === "duration"
            ? parseInt((a as any).duration, 10)
            : (a as any).recovery;
        const valB =
          key === "duration"
            ? parseInt((b as any).duration, 10)
            : (b as any).recovery;
        return (valA - valB) * order;
      });
    }
    return candidates;
  },
  getValidSlots: () => {
    // ... (既存のコード) ...
    const { slots } = get();
    const activeRule = get().getActiveRule();
    if (!activeRule || !activeRule.categories) return [];
    return slots.filter(
      (slot) => slot.category && activeRule.categories?.includes(slot.category)
    );
  },

  // --- Actions ---
  fetchData: async () => {
    // (変更なし、これはAdminが登録した公開リチャージを読み込む)
    const fetchRecharges = async (): Promise<RechargeAction[]> => {
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const d = doc.data();
        const autoCategory = (() => {
          // ... (autoCategoryロジック) ...
          const t = d.title || "";
          if (
            t.includes("ヨガ") ||
            t.includes("運動") ||
            t.includes("ストレッチ")
          )
            return "ワークアウト";
          if (t.includes("散歩") || t.includes("外出")) return "リフレッシュ";
          if (t.includes("瞑想") || t.includes("整理")) return "考えの整理";
          if (t.includes("睡眠") || t.includes("昼寝")) return "疲労回復";
          if (t.includes("準備")) return "準備・対策";
          return "その他";
        })();
        return {
          label: d.title || "No Title",
          duration: typeof d.duration === "number" ? d.duration : 30,
          recovery: d.recovery ?? 3,
          category: (d.category ?? autoCategory).trim(),
          recommendedTimeRange: d.recommendedTime ?? "",
        };
      }) as RechargeAction[];
    };
    const fetchRules = async (): Promise<RechargeRule[]> => {
      const q = query(
        collection(db, "rechargeRules"),
        where("active", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RechargeRule[];
    };
    try {
      const [rechargesData, rulesData] = await Promise.all([
        fetchRecharges(),
        fetchRules(),
      ]);
      set({ allRecharges: rechargesData, rechargeRules: rulesData });
    } catch (error) {
      console.error("Error fetching public data from Firestore:", error);
    }
  },

  setTimeZone: (zone) => set({ timeZone: zone }),

  // --- 👇 修正: Firestore連携アクション ---

  /**
   * ユーザー個人のリチャージスロットをFirestoreに保存
   */
  addSlot: async (slot) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Cannot add slot: User not logged in.");
      return;
    }
    try {
      // id を除いたデータを準備 (Firestoreが自動採番)
      const slotData: Omit<RechargeSlot, "id"> = {
        label: slot.label,
        start: slot.start,
        end: slot.end,
        category: slot.category,
        intensity: slot.intensity ?? null,
        actions: slot.actions ?? [],
      };
      // ユーザー専用のサブコレクションに保存
      const subCollectionRef = collection(
        db,
        "userProfiles",
        user.uid,
        "userRecharges"
      );
      await addDoc(subCollectionRef, slotData);
      // ストアの 'slots' 配列は onSnapshot リスナーによって自動的に更新される
      console.log("✅ User recharge slot added to Firestore.");
    } catch (e) {
      console.error("❌ Error adding user recharge slot to Firestore:", e);
    }
  },

  /**
   * ユーザー個人のリチャージスロットをFirestoreから削除
   */
  removeRecharge: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Cannot remove slot: User not logged in.");
      return;
    }
    try {
      // ユーザー専用のサブコレクションから削除
      const docRef = doc(db, "userProfiles", user.uid, "userRecharges", id);
      await deleteDoc(docRef);
      // ストアの 'slots' 配列は onSnapshot リスナーによって自動的に更新される
      console.log("✅ User recharge slot deleted from Firestore.");
    } catch (e) {
      console.error("❌ Error deleting user recharge slot from Firestore:", e);
    }
  },

  /**
   * ログインユーザー専用のリチャージスロット監視を開始 (AuthWrapperから呼ぶ)
   */
  initUserRechargesListener: (uid) => {
    get().clearUserRechargesListener(); // 既存のリスナーがあれば解除

    console.log(`Initializing user recharges listener for UID: ${uid}`);
    const subCollectionRef = collection(
      db,
      "userProfiles",
      uid,
      "userRecharges"
    );

    const unsubscribe = onSnapshot(
      subCollectionRef,
      (snapshot) => {
        const userSlots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RechargeSlot[];

        set({ slots: userSlots }); // ストアの状態をFirestoreと同期
        console.log(`✅ User recharges loaded: ${userSlots.length} items.`);
      },
      (error) => {
        console.error("❌ Error listening to user recharges:", error);
        set({ slots: [] }); // エラー時は空にする
      }
    );

    set({ unsubscribeUserRecharges: unsubscribe }); // 解除関数をストアに保存
  },

  /**
   * リチャージスロットの監視を停止 (ログアウト時にAuthWrapperから呼ぶ)
   */
  clearUserRechargesListener: () => {
    const unsubscribe = get().unsubscribeUserRecharges;
    if (unsubscribe) {
      unsubscribe();
      console.log("User recharges listener cleared.");
    }
    set({ slots: [], unsubscribeUserRecharges: null }); // ストアをクリア
  },
  // --- 👆 修正ここまで ---
});

export const useRechargesStore =
  create<RechargeStoreState>()(rechargeStoreCreator);
