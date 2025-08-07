// src/stores/useRechargesStore.ts
import { create } from "zustand";

export type RechargeSlot = {
  id: string;
  time: string;
  category: string;
  actions: string[];
};

type State = {
  slots: RechargeSlot[];
  // ① slot オブジェクトを丸ごと受け取るよう変更
  addRecharge: (slot: RechargeSlot) => void;
  removeRecharge: (id: string) => void;
};

export const useRechargesStore = create<State>((set) => ({
  slots: [],

  // ② slot を受け取ってそのまま追加
  addRecharge: (slot) =>
    set((state) => ({
      slots: [...state.slots, slot],
    })),

  // ③ id を受け取って削除
  removeRecharge: (id) =>
    set((state) => ({
      slots: state.slots.filter((s) => s.id !== id),
    })),
}));
