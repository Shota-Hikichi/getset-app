import { create } from "zustand";
import {
  calculateBalanceStatus,
  BalanceStatus,
} from "../utils/calculateBalance";

interface ProgressState {
  sleepHours: number;
  maxEvents: number;
  totalDuration: number;
  balanceScore: number;
  balanceStatus: BalanceStatus;
  setProgress: (sleep: number, events: number, total: number) => void;
  setSleepHours: (sleep: number) => void; // ✅ 追加
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  sleepHours: 0,
  maxEvents: 3,
  totalDuration: 4,
  balanceScore: 75,
  balanceStatus: "normal",

  setProgress: (sleep, events, total) => {
    const { score, status } = calculateBalanceStatus(sleep, events, total);
    set({
      sleepHours: sleep,
      maxEvents: events,
      totalDuration: total,
      balanceScore: score,
      balanceStatus: status,
    });
  },

  // ✅ 新メソッド：睡眠のみ更新しても即反映される
  setSleepHours: (sleep) => {
    const { maxEvents, totalDuration } = get();
    const { score, status } = calculateBalanceStatus(
      sleep,
      maxEvents,
      totalDuration
    );
    set({
      sleepHours: sleep,
      balanceScore: score,
      balanceStatus: status,
    });
  },
}));
