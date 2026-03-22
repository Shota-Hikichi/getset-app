// src/lib/googleApi.ts
import type { CalendarEvent } from "../types/calendar";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY!;

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

// gapiの初期化
function gapiLoaded() {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
  });
}

// GISの初期化
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}, // 後から上書き
  });
  gisInited = true;
}

// Google API初期化とログインを一度だけ行う
export const initGoogleApi = async (): Promise<void> => {
  // 1) ライブラリ初期化
  if (!gapiInited) gapiLoaded();
  if (!gisInited) gisLoaded();

  await new Promise<void>((resolve) => {
    const iv = setInterval(() => {
      if (gapiInited && gisInited) {
        clearInterval(iv);
        resolve();
      }
    }, 50);
  });

  // 2) すでに有効なトークンがあれば何もしない
  //    gapi.client.getToken() は { access_token, scope, ..., expires_in } などを返す
  const existing = gapi.client.getToken();
  if (existing && existing.access_token) {
    return;
  }

  // 3) トークン取得（初回またはトークン切れ時のみポップアップが出る）
  return new Promise<void>((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("TokenClientが初期化されていません"));
      return;
    }

    tokenClient.callback = (resp) => {
      if (resp.error) {
        console.error("アクセストークン取得エラー:", resp);
        reject(resp);
        return;
      }
      resolve();
    };
    tokenClient.requestAccessToken();
  });
};

// カレンダー予定を取得
export const listUpcomingEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const resp = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    });

    const items = resp.result.items ?? [];
    return items
      .map((ev, idx) => {
        const start = ev.start?.dateTime || ev.start?.date;
        const end = ev.end?.dateTime || ev.end?.date;
        if (!start || !end) return null;
        return {
          id: ev.id || `event-${idx}`,
          summary: ev.summary || "(無題)",
          start,
          end,
          intensity: (idx % 5) + 1,
        };
      })
      .filter((e): e is CalendarEvent => e !== null);
  } catch (err) {
    console.error("カレンダー取得失敗:", err);
    return [];
  }
};

export default { initGoogleApi, listUpcomingEvents };
