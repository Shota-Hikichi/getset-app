// src/pages/MeetingPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, ExternalLink, Plus, X } from "lucide-react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

type Platform = "zoom" | "meet";

interface Meeting {
  id: string;
  platform: Platform;
  title: string;
  date: string;
  time: string;
  url: string;
  createdAt: string;
}

const EMPTY_FORM = {
  platform: "zoom" as Platform,
  title: "",
  date: "",
  time: "",
  url: "",
};

const ZoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#2D8CFF" />
    <path
      d="M10 22a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v12l10-7v10l-10-7v3a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V22z"
      fill="white"
    />
  </svg>
);

const MeetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#00897B" />
    <path d="M10 22h20v20H10z" fill="#4FC3F7" />
    <path d="M30 22l14-8v36l-14-8V22z" fill="white" />
    <path d="M10 22h20l-6 10H10V22z" fill="white" opacity="0.5" />
  </svg>
);

const PlatformBadge: React.FC<{ platform: Platform }> = ({ platform }) => (
  <div className="flex items-center gap-1.5">
    {platform === "zoom" ? <ZoomIcon /> : <MeetIcon />}
    <span
      className={`text-[12px] font-semibold ${
        platform === "zoom" ? "text-[#2D8CFF]" : "text-[#00897B]"
      }`}
    >
      {platform === "zoom" ? "Zoom" : "Google Meet"}
    </span>
  </div>
);

const MeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUid = () => auth.currentUser?.uid ?? null;

  const fetchMeetings = async () => {
    const uid = getUid();
    if (!uid) { setLoading(false); return; }
    try {
      const ref = collection(db, "userProfiles", uid, "meetings");
      const q = query(ref, orderBy("date"), orderBy("time"));
      const snap = await getDocs(q);
      setMeetings(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Meeting[]);
    } catch {
      // orderBy が使えない場合はシンプル取得
      try {
        const ref = collection(db, "userProfiles", uid, "meetings");
        const snap = await getDocs(ref);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Meeting[];
        list.sort((a, b) => `${a.date}${a.time}` > `${b.date}${b.time}` ? 1 : -1);
        setMeetings(list);
      } catch (e) {
        console.error("ミーティング取得エラー:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(() => fetchMeetings());
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { setError("タイトルを入力してください。"); return; }
    if (!form.date) { setError("日付を入力してください。"); return; }
    if (!form.time) { setError("時刻を入力してください。"); return; }
    if (!form.url.trim()) { setError("ミーティングURLを入力してください。"); return; }
    if (!form.url.startsWith("http")) { setError("有効なURL（http〜）を入力してください。"); return; }

    const uid = getUid();
    if (!uid) { setError("ログインが必要です。"); return; }

    setSaving(true);
    setError(null);
    try {
      const ref = collection(db, "userProfiles", uid, "meetings");
      await addDoc(ref, { ...form, createdAt: new Date().toISOString() });
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      await fetchMeetings();
    } catch (e: any) {
      setError(`保存に失敗しました: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const uid = getUid();
    if (!uid) return;
    if (!confirm("このミーティングを削除しますか？")) return;
    await deleteDoc(doc(db, "userProfiles", uid, "meetings", id));
    await fetchMeetings();
  };

  const upcoming = meetings.filter(
    (m) => `${m.date}T${m.time}` >= new Date().toISOString().slice(0, 16)
  );
  const past = meetings.filter(
    (m) => `${m.date}T${m.time}` < new Date().toISOString().slice(0, 16)
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full text-slate-600 hover:bg-slate-100 mr-2">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-[17px] font-semibold text-slate-900">ミーティング</h1>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="flex items-center gap-1 text-[13px] font-medium text-sky-500 hover:text-sky-600 pr-1"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "閉じる" : "追加"}
        </button>
      </header>

      <main className="px-4 pt-4 space-y-4">

        {/* 新規追加フォーム */}
        {showForm && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-slate-900">新しいミーティング</h2>

            {/* プラットフォーム選択 */}
            <div>
              <p className="text-[12px] text-slate-400 mb-2">プラットフォーム</p>
              <div className="flex gap-2">
                {(["zoom", "meet"] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, platform: p }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all ${
                      form.platform === p
                        ? p === "zoom"
                          ? "border-[#2D8CFF] bg-blue-50 text-[#2D8CFF]"
                          : "border-[#00897B] bg-teal-50 text-[#00897B]"
                        : "border-slate-200 text-slate-500 bg-white"
                    }`}
                  >
                    {p === "zoom" ? <ZoomIcon /> : <MeetIcon />}
                    {p === "zoom" ? "Zoom" : "Google Meet"}
                  </button>
                ))}
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-[12px] text-slate-400 mb-1">タイトル</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="例：週次チームMTG"
              />
            </div>

            {/* 日付・時刻 */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[12px] text-slate-400 mb-1">日付</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[12px] text-slate-400 mb-1">時刻</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-[12px] text-slate-400 mb-1">ミーティングURL</label>
              <input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="https://zoom.us/j/... または https://meet.google.com/..."
              />
            </div>

            {/* エラー */}
            {error && (
              <p className="text-[13px] text-rose-500">{error}</p>
            )}

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-[15px] font-semibold transition-colors"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
          </section>
        )}

        {/* 予定されているミーティング */}
        <section>
          <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
            予定されているミーティング
          </h2>
          {loading ? (
            <div className="text-center text-slate-400 text-[13px] py-8">読み込み中...</div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-8 text-center">
              <p className="text-[14px] text-slate-400">予定されているミーティングはありません</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-[13px] text-sky-500 font-medium"
              >
                ＋ ミーティングを追加する
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((m) => (
                <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>

        {/* 過去のミーティング */}
        {past.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              過去のミーティング
            </h2>
            <div className="space-y-2 opacity-60">
              {past.map((m) => (
                <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} isPast />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const MeetingCard: React.FC<{
  meeting: Meeting;
  onDelete: (id: string) => void;
  isPast?: boolean;
}> = ({ meeting, onDelete, isPast }) => {
  const dateLabel = meeting.date
    ? new Date(meeting.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : "";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <PlatformBadge platform={meeting.platform} />
          </div>
          <p className="text-[15px] font-semibold text-slate-900 mb-1 truncate">{meeting.title}</p>
          <p className="text-[12px] text-slate-400">
            {dateLabel}　{meeting.time}
          </p>
        </div>
        <button
          onClick={() => onDelete(meeting.id)}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!isPast && (
        <a
          href={meeting.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[14px] font-semibold text-white transition-colors ${
            meeting.platform === "zoom"
              ? "bg-[#2D8CFF] hover:bg-[#1a7ae8]"
              : "bg-[#00897B] hover:bg-[#00796B]"
          }`}
        >
          <ExternalLink size={15} />
          {meeting.platform === "zoom" ? "Zoomに参加する" : "Google Meetに参加する"}
        </a>
      )}
    </div>
  );
};

export default MeetingPage;
