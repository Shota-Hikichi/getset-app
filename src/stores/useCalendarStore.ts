// src/stores/useCalendarStore.ts
import { create } from "zustand";
import type { CalendarEvent } from "../types/calendar";

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  setEvents: (events: CalendarEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearEvents: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  setEvents: (events) => set({ events, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearEvents: () => set({ events: [], error: null }),
}));
