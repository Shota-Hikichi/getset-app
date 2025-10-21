// src/types/recharge.ts
export type RechargeAction = {
  label: string;
  duration: number; // ← string から number へ変更 ★★★
  recovery: number;
  category?: string;
  timeZone?: "morning" | "during" | "after";
};

// src/types/calendar.ts (重複定義の可能性あり、必要に応じて整理)
// もし calendar.ts にも同じ定義がある場合、どちらか一方にまとめることを推奨します。
export interface RechargeEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  intensity: number;
}

// src/types/recharge.ts (重複定義の可能性あり、必要に応じて整理)
// もし calendar.ts にも同じ定義がある場合、どちらか一方にまとめることを推奨します。
export type RechargeSlot = {
  id: string;
  start: string; // ISO形式
  end: string; // ISO形式
  time: string; // "07:00 - 07:30" のような表示用文字列
  category: string; // 例: "ワークアウト"
  title: string; // 例: "クイックヨガ"
  actions: string[]; // 詳細アクション
  intensity: number; // intensity を含める
};
