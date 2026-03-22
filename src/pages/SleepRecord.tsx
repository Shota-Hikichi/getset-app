import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ChevronLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type SleepLog = {
  date: Date; // 対象日（0:00基準）
  minutes: number; // 睡眠時間(分)
};

// Firestore: users/{uid}/sleepLogs/{autoId} に以下の形で格納想定
// { date: Timestamp, minutes: number }

const MOCK: SleepLog[] = [
  // 最近7日分のモック
  { date: new Date("2024-07-07"), minutes: 9 * 60 + 12 },
  { date: new Date("2024-07-08"), minutes: 5 * 60 + 43 },
  { date: new Date("2024-07-09"), minutes: 6 * 60 + 54 },
  { date: new Date("2024-07-10"), minutes: 5 * 60 + 12 },
  { date: new Date("2024-07-11"), minutes: 5 * 60 + 32 },
  { date: new Date("2024-07-12"), minutes: 7 * 60 + 30 },
  { date: new Date("2024-07-13"), minutes: 7 * 60 + 45 },
];

const fmtHM = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}時間${mm}分`;
};

const dayLabel = (d: Date) =>
  format(d, "E", { locale: ja }).replace("曜日", ""); // 日〜土

const SleepRecord: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 認証→データ取得（あればFirestore、なければモック）
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setLogs(MOCK);
        setLoading(false);
        return;
      }
      setUid(user.uid);
      try {
        const col = collection(db, "users", user.uid, "sleepLogs");
        // 直近14日をざっくり（必要なら where 追加）
        const q = query(col, orderBy("date", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          setLogs(MOCK);
        } else {
          const arr: SleepLog[] = snap.docs.map((d) => {
            const data = d.data() as { date: Timestamp; minutes: number };
            return { date: data.date.toDate(), minutes: data.minutes };
          });
          // 直近7件に絞って日付昇順へ
          const latest7 = arr.slice(0, 7).reverse();
          setLogs(latest7);
        }
      } catch {
        setLogs(MOCK);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // 棒グラフ用データ（日→土の順で並べ替え）
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];
    // 表示順：日→土（現在のlogsは既に昇順想定）
    return logs.map((l) => ({
      name: dayLabel(l.date),
      hours: Math.round((l.minutes / 60) * 10) / 10, // 7.5 など
    }));
  }, [logs]);

  const avgMinutes = useMemo(() => {
    if (logs.length === 0) return 0;
    return Math.round(
      logs.reduce((sum, l) => sum + l.minutes, 0) / logs.length
    );
  }, [logs]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
            aria-label="戻る"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">睡眠の記録</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="px-4 pb-24">
        {/* 睡眠時間/平均 */}
        <section className="pt-4">
          <div className="text-sm text-slate-600">睡眠時間</div>
          <div className="mt-1 text-sm text-slate-500">平均</div>
          <div className="text-2xl font-bold text-slate-800">
            {fmtHM(avgMinutes)}
          </div>

          {/* 棒グラフ */}
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 16, left: -8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 16]}
                  ticks={[0, 3, 6, 9, 12, 15]}
                />
                <Tooltip
                  separator=""
                  formatter={(value: any) => [`${value}時間`, ""]} // 単位だけ表示
                />
                <Bar dataKey="hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 履歴リスト */}
        <section className="mt-6">
          <div className="text-sm font-semibold text-slate-700">
            直近の睡眠時間の推移
          </div>
          <ul className="mt-2 divide-y divide-slate-200">
            {logs
              .slice()
              .reverse()
              .map((l, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-slate-700">
                    {format(l.date, "M月d日", { locale: ja })}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {fmtHM(l.minutes)}
                  </span>
                </li>
              ))}
          </ul>
        </section>

        {loading && (
          <div className="py-8 text-center text-sm text-slate-500">
            読み込み中…
          </div>
        )}
      </main>
    </div>
  );
};

export default SleepRecord;
