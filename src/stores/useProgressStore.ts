// src/stores/useProgressStore.ts
import { create } from "zustand";

type ProgressState = {
  sleepHours: number;
  maxEvents: number;
  totalDuration: number; // 単位は時間(h)
  setSleepHours: (h: number) => void;
  setMaxEvents: (n: number) => void;
  setTotalDuration: (h: number) => void;
};

export const useProgressStore = create<ProgressState>((set) => ({
  sleepHours: 7, // 初期値サンプル
  maxEvents: 4, // 初期値サンプル
  totalDuration: 2.5, // 初期値サンプル

  setSleepHours: (h) => set({ sleepHours: h }),
  setMaxEvents: (n) => set({ maxEvents: n }),
  setTotalDuration: (h) => set({ totalDuration: h }),
}));
