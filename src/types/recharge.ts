// src/types/recharge.ts
export type RechargeAction = {
  label: string;
  duration: string; // ← これを追加
  recovery: number;
};
