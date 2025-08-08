// src/stores/useRechargesStore.ts
import { create } from "zustand";
import type { RechargeEvent } from "../types/calendar";

interface RechargesState {
  recharges: RechargeEvent[];
  addRecharge: (event: RechargeEvent) => void;
}

export type RechargeSlot = {
  id: string;
  title: string;
  start: string;
  end: string;
  intensity: number;
  time: string; // ← 必須
  category: string; // ← 必須
  actions: string[]; // ← 必須
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
