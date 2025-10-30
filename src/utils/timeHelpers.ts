// src/utils/timeHelpers.ts
export function getDayType(date: Date): "workday" | "holiday" {
  const day = date.getDay();
  // 0 = 日曜, 6 = 土曜
  return day === 0 || day === 6 ? "holiday" : "workday";
}

export function getZoneFromDate(date: Date): "morning" | "during" | "after" {
  const hour = date.getHours();
  // 9時前 = 朝
  if (hour < 9) return "morning";
  // 9時～18時前 = 昼 (就業中)
  if (hour >= 9 && hour < 18) return "during";
  // 18時以降 = 夜
  return "after";
}
