export type RechargeRule = {
  id?: string;
  dayType: "workday" | "holiday"; // 就業日 / 就業日以外
  timing: "morning" | "during" | "after"; // 就業前 / 中 / 後
  slot: number; // 1〜9
  priority: number; // 優先度
  duration: string; // 5分, 30分, 1時間以上など
  note?: string; // 備考
  active?: boolean;
  updatedAt?: string;
  timeZone?: "morning" | "during" | "after";
  minRecovery?: number;
  maxRecovery?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: "recovery" | "duration";
  sortOrder?: "asc" | "desc";
  categories?: string[]; // ["ワークアウト", "リフレッシュ"] のように複数指定可能
};
