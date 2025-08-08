// src/types/recharge.ts
export type RechargeAction = {
  label: string;
  duration: string; // ← これを追加
  recovery: number;
};

// src/types/calendar.ts

export interface RechargeEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  intensity: number;
}
