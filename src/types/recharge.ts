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

// src/types/recharge.ts

// ...（既存の定義があってもOK）

export type RechargeSlot = {
  id: string;
  start: string; // ISO形式
  end: string; // ISO形式
  time: string; // "07:00 - 07:30" のような表示用文字列
  category: string; // 例: "ワークアウト"
  title: string; // 例: "クイックヨガ"
  actions: string[]; // 詳細アクション（まだ空配列でもOK）
  intensity: number;
};
