import { create, StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// 型定義をインポート
import type { RechargeAction } from "../types/recharge";
import type { RechargeRule } from "../types/rechargeRule";

// ヘルパー関数
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

/**
 * ストアで管理するスロットの型
 */
export interface RechargeSlot {
  id: string;
  start: string;
  end: string;
  category: string;
  label?: string;
}

/**
 * ストア全体の型定義
 */
export interface RechargeStoreState {
  // === 状態 (State) ===
  slots: RechargeSlot[];
  allRecharges: RechargeAction[];
  rechargeRules: RechargeRule[];
  timeZone: "morning" | "during" | "after";

  // === セレクタ (Selectors / Getters) ===
  getActiveRule: () => RechargeRule | null;
  getFilteredRecharges: () => RechargeAction[];
  getValidSlots: () => RechargeSlot[];

  // === アクション (Actions) ===
  fetchData: () => Promise<void>;
  setTimeZone: (zone: "morning" | "during" | "after") => void;
  addSlot: (slot: Omit<RechargeSlot, "id">) => void;
  removeRecharge: (id: string) => void;
}

const rechargeStoreCreator: StateCreator<RechargeStoreState> = (set, get) => ({
  slots: [],
  allRecharges: [],
  rechargeRules: [],
  timeZone: getCurrentTimeZone(),
  getActiveRule: () => {
    const { rechargeRules, timeZone } = get();
    if (rechargeRules.length === 0) return null;
    const now = new Date();
    const currentDayType = getDayType(now);
    const matchingRules = rechargeRules.filter(
      (rule) => rule.dayType === currentDayType && rule.timeZone === timeZone
    );
    if (matchingRules.length === 0) return null;
    return matchingRules.sort((a, b) => b.priority - a.priority)[0];
  },
  getFilteredRecharges: () => {
    const { allRecharges } = get();
    const activeRule = get().getActiveRule();
    if (!activeRule || allRecharges.length === 0) return [];
    let candidates = allRecharges.filter((recharge) => {
      const duration = parseInt(recharge.duration, 10) || 0;
      const recovery = recharge.recovery;
      const categoryMatch =
        !activeRule.categories ||
        activeRule.categories.length === 0 ||
        (recharge.category &&
          activeRule.categories.includes(recharge.category.trim()));
      const durationMatch =
        duration >= (activeRule.minDuration ?? 0) &&
        duration <= (activeRule.maxDuration ?? Infinity);
      const recoveryMatch =
        recovery >= (activeRule.minRecovery ?? 0) &&
        recovery <= (activeRule.maxRecovery ?? Infinity);
      return categoryMatch && durationMatch && recoveryMatch;
    });
    if (activeRule.sortBy && activeRule.sortOrder) {
      candidates.sort((a, b) => {
        const key = activeRule.sortBy!;
        const order = activeRule.sortOrder === "asc" ? 1 : -1;
        const valA = key === "duration" ? parseInt(a.duration, 10) : a.recovery;
        const valB = key === "duration" ? parseInt(b.duration, 10) : b.recovery;
        return (valA - valB) * order;
      });
    }
    return candidates;
  },
  getValidSlots: () => {
    const { slots } = get();
    const activeRule = get().getActiveRule();
    if (!activeRule || !activeRule.categories) return [];
    return slots.filter(
      (slot) => slot.category && activeRule.categories?.includes(slot.category)
    );
  },
  fetchData: async () => {
    const fetchRecharges = async (): Promise<RechargeAction[]> => {
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const d = doc.data();
        const autoCategory = (() => {
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
          label: d.title,
          duration: d.duration?.toString() ?? "30",
          recovery: d.recovery ?? 3,
          category: (d.category ?? autoCategory).trim(),
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
    const [rechargesData, rulesData] = await Promise.all([
      fetchRecharges(),
      fetchRules(),
    ]);
    set({ allRecharges: rechargesData, rechargeRules: rulesData });
  },
  setTimeZone: (zone) => set({ timeZone: zone }),
  addSlot: (slot) =>
    set((state) => ({
      slots: [...state.slots, { id: uuidv4(), ...slot }],
    })),
  removeRecharge: (id) =>
    set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),
});

// ✅ create<...>()(...) の形式に修正
export const useRechargesStore =
  create<RechargeStoreState>()(rechargeStoreCreator);
