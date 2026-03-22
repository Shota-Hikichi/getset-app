// src/stores/useTimeSettingsStore.ts
import { create } from "zustand";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface TimePeriod {
  start: number;   // 0-23
  end: number;     // 0-23 (exclusive)
  enabled: boolean;
}

export interface TimeSettings {
  commute: TimePeriod;          // 通勤時間（往路）
  work: TimePeriod;             // 勤務時間（デフォルト 9-17）
  sleep: TimePeriod;            // 就寝時間（デフォルト 23-7、深夜をまたぐ）
  workBreakEnabled: boolean;    // 勤務中の休憩時間にリチャージを提案するか
  workBreakSlots: TimePeriod[]; // 休憩時間帯（デフォルト 11-14, 17-19）
}

export const DEFAULT_TIME_SETTINGS: TimeSettings = {
  commute:  { start: 7, end: 9, enabled: false },
  work:     { start: 9, end: 17, enabled: true },
  sleep:    { start: 23, end: 7, enabled: true },
  workBreakEnabled: true,
  workBreakSlots: [
    { start: 11, end: 14, enabled: true },
    { start: 17, end: 19, enabled: true },
  ],
};

// 指定した時間（hour）が期間内かどうかを判定（深夜をまたぐ範囲に対応）
function isHourInPeriod(period: TimePeriod, hour: number): boolean {
  if (!period.enabled) return false;
  const { start, end } = period;
  if (start <= end) {
    return hour >= start && hour < end;
  }
  // 深夜をまたぐ範囲（例: 23-7）
  return hour >= start || hour < end;
}

/**
 * 現在時刻がリチャージをブロックすべき時間帯かどうかを返す。
 * true = リチャージを提案しない
 */
export function isTimeBlocked(settings: TimeSettings, hour: number): boolean {
  // 通勤時間
  if (isHourInPeriod(settings.commute, hour)) return true;

  // 就寝時間
  if (isHourInPeriod(settings.sleep, hour)) return true;

  // 勤務時間
  if (isHourInPeriod(settings.work, hour)) {
    if (!settings.workBreakEnabled) return true;
    // 休憩時間帯は例外（ブロックしない）
    const inBreak = settings.workBreakSlots.some(
      (slot) => slot.enabled && isHourInPeriod(slot, hour)
    );
    if (inBreak) return false;
    return true;
  }

  return false;
}

interface TimeSettingsState extends TimeSettings {
  isLoaded: boolean;
  loadFromFirestore: (uid: string) => Promise<void>;
  saveToFirestore: (uid: string) => Promise<void>;
  setPeriod: (
    key: "commute" | "work" | "sleep",
    patch: Partial<TimePeriod>
  ) => void;
  setBreakSlot: (index: number, patch: Partial<TimePeriod>) => void;
  setWorkBreakEnabled: (enabled: boolean) => void;
}

export const useTimeSettingsStore = create<TimeSettingsState>((set, get) => ({
  ...DEFAULT_TIME_SETTINGS,
  isLoaded: false,

  loadFromFirestore: async (uid) => {
    try {
      const snap = await getDoc(doc(db, "userProfiles", uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.timeSettings) {
          set({ ...data.timeSettings, isLoaded: true });
          return;
        }
      }
    } catch (e) {
      console.error("timeSettings 読み込みエラー:", e);
    }
    set({ isLoaded: true });
  },

  saveToFirestore: async (uid) => {
    const state = get();
    const settings: TimeSettings = {
      commute: state.commute,
      work: state.work,
      sleep: state.sleep,
      workBreakEnabled: state.workBreakEnabled,
      workBreakSlots: state.workBreakSlots,
    };
    await setDoc(
      doc(db, "userProfiles", uid),
      { timeSettings: settings },
      { merge: true }
    );
  },

  setPeriod: (key, patch) =>
    set((s) => ({ [key]: { ...s[key], ...patch } } as any)),

  setBreakSlot: (index, patch) =>
    set((s) => ({
      workBreakSlots: s.workBreakSlots.map((slot, i) =>
        i === index ? { ...slot, ...patch } : slot
      ),
    })),

  setWorkBreakEnabled: (enabled) => set({ workBreakEnabled: enabled }),
}));
