// src/stores/useRechargesStore.ts
import { create, StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// 型定義をインポート
// ✅ RechargeAction 型の duration を number に変更することを強く推奨
import type { RechargeAction } from "../types/recharge";
import type { RechargeRule } from "../types/rechargeRule";

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

/**
 * ストアで管理するスロットの型 (念のため intensity と actions を追加)
 */
export interface RechargeSlot {
  id: string;
  start: string;
  end: string;
  category: string;
  label?: string;
  intensity?: number | null; // MyPageで使われている可能性
  actions?: string[]; // MyPageで使われている可能性
}

/**
 * ストア全体の型定義 (変更なし)
 */
export interface RechargeStoreState {
  slots: RechargeSlot[];
  allRecharges: RechargeAction[]; // duration の型に注意
  rechargeRules: RechargeRule[];
  timeZone: "morning" | "during" | "after";
  getActiveRule: () => RechargeRule | null;
  getFilteredRecharges: () => RechargeAction[];
  getValidSlots: () => RechargeSlot[];
  fetchData: () => Promise<void>;
  setTimeZone: (zone: "morning" | "during" | "after") => void;
  addSlot: (slot: Omit<RechargeSlot, "id">) => void;
  removeRecharge: (id: string) => void;
}

// ストア作成ロジック
const rechargeStoreCreator: StateCreator<RechargeStoreState> = (set, get) => ({
  slots: [],
  allRecharges: [],
  rechargeRules: [],
  timeZone: getCurrentTimeZone(),

  // --- Selectors ---
  getActiveRule: () => {
    // (実装変更なし)
    const { rechargeRules, timeZone } = get();
    if (rechargeRules.length === 0) {
      // console.log("getActiveRule: No rules loaded.");
      return null;
    }
    const now = new Date();
    const currentDayType = getDayType(now);
    // console.log(`getActiveRule: currentDayType=${currentDayType}, timeZone=${timeZone}`);
    const matchingRules = rechargeRules.filter(
      (rule) =>
        rule.dayType === currentDayType &&
        rule.timeZone === timeZone &&
        rule.active // ✅ active ルールのみ
    );
    // console.log("getActiveRule: Matching rules:", matchingRules);
    if (matchingRules.length === 0) return null;
    const bestRule = matchingRules.sort((a, b) => b.priority - a.priority)[0];
    // console.log("getActiveRule: Selected best rule:", bestRule);
    return bestRule;
  },
  getFilteredRecharges: () => {
    const { allRecharges } = get();
    const activeRule = get().getActiveRule(); // 上記で active ルールのみ取得
    if (!activeRule || allRecharges.length === 0) {
      console.log("フィルタリング: ルールなし or 全リチャージデータなし");
      return [];
    }

    console.log("フィルタリング開始: 適用ルール", activeRule);
    console.log("フィルタリング対象:", allRecharges);

    let candidates = allRecharges.filter((recharge) => {
      // ✅ duration を数値として扱う (parseInt不要に)
      //    allRecharges 配列内の duration が数値であることを期待
      const duration = recharge.duration;
      const recovery = recharge.recovery;

      const categoryMatch =
        !activeRule.categories ||
        activeRule.categories.length === 0 ||
        (recharge.category &&
          activeRule.categories.includes(recharge.category.trim()));

      // ✅ duration が数値か確認してから比較
      const durationMatch =
        typeof duration === "number" &&
        duration >= (activeRule.minDuration ?? 0) &&
        duration <= (activeRule.maxDuration ?? Infinity);

      const recoveryMatch =
        recovery >= (activeRule.minRecovery ?? 0) &&
        recovery <= (activeRule.maxRecovery ?? Infinity);

      // デバッグログ
      console.log(
        `Checking ${recharge.label}: category=${categoryMatch}(${
          recharge.category
        }), duration=${durationMatch}(val:${duration}, rule:${
          activeRule.minDuration
        }-${
          activeRule.maxDuration
        }), recovery=${recoveryMatch}(val:${recovery}, rule:${
          activeRule.minRecovery
        }-${activeRule.maxRecovery}) -> ${
          categoryMatch && durationMatch && recoveryMatch
        }`
      );

      return categoryMatch && durationMatch && recoveryMatch;
    });

    console.log("フィルタリング結果:", candidates);

    // ソート処理 (parseInt 不要に)
    if (activeRule.sortBy && activeRule.sortOrder) {
      candidates.sort((a, b) => {
        const key = activeRule.sortBy!;
        const order = activeRule.sortOrder === "asc" ? 1 : -1;
        // ✅ duration は既に数値なので parseInt 不要
        const valA = key === "duration" ? a.duration : a.recovery;
        const valB = key === "duration" ? b.duration : b.recovery;
        // 数値でない場合の比較を考慮 (念のため)
        const numA = typeof valA === "number" ? valA : 0;
        const numB = typeof valB === "number" ? valB : 0;
        return (numA - numB) * order;
      });
    }
    return candidates;
  },
  getValidSlots: () => {
    // (実装変更なし)
    const { slots } = get();
    const activeRule = get().getActiveRule();
    if (!activeRule || !activeRule.categories) return [];
    return slots.filter(
      (slot) => slot.category && activeRule.categories?.includes(slot.category)
    );
  },

  // --- Actions ---
  fetchData: async () => {
    const fetchRecharges = async (): Promise<RechargeAction[]> => {
      // 型は RechargeAction
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true) // published: true のみ取得
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

        // ★★★ ここを修正 ★★★
        return {
          label: d.title || "No Title",
          // ✅ Firestore の duration (数値) をそのまま使う。なければデフォルト値 30 (数値)
          duration: typeof d.duration === "number" ? d.duration : 30,
          recovery: d.recovery ?? 3,
          category: (d.category ?? autoCategory).trim(),
          // timeZone: d.timeZone ?? 'during', // 必要なら timeZone も取得
        };
        // }) as RechargeAction[]; // 型エラーが出る場合は RechargeAction の duration を number に変更する
      }); // キャストを一時的に削除
    };
    const fetchRules = async (): Promise<RechargeRule[]> => {
      const q = query(
        collection(db, "rechargeRules"),
        where("active", "==", true) // active: true のみ取得
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        return {
          // ✅ return を確認 (OK)
          id: doc.id,
          ...doc.data(),
        };
      }) as RechargeRule[];
    };

    try {
      const [rechargesDataUntyped, rulesData] = await Promise.all([
        fetchRecharges(),
        fetchRules(),
      ]);
      // ✅ fetchData の戻り値の型を合わせる (duration が number になっていることを想定)
      const rechargesData = rechargesDataUntyped as RechargeAction[];

      console.log("Fetched Recharges:", rechargesData);
      console.log("Fetched Rules:", rulesData);
      set({ allRecharges: rechargesData, rechargeRules: rulesData });
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  },
  setTimeZone: (zone) => set({ timeZone: zone }),
  addSlot: (slot) =>
    set((state) => ({
      slots: [
        ...state.slots,
        {
          id: uuidv4(),
          intensity: null,
          actions: [],
          ...slot,
        },
      ],
    })),
  removeRecharge: (id) =>
    set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),
});

export const useRechargesStore =
  create<RechargeStoreState>()(rechargeStoreCreator);

// --- 型定義の修正推奨 ---
// ファイル: src/types/recharge.ts
/*
export type RechargeAction = {
  label: string;
  duration: number; // ← string から number へ修正推奨
  recovery: number;
  category?: string;
  timeZone?: "morning" | "during" | "after";
};
*/
