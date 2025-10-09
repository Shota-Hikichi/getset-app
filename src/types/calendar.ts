// src/types/calendar.ts
export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  intensity: number;
  isRecharge?: boolean;
};

// src/types/calendar.ts

export interface RechargeEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  intensity: number;
}
