import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type PointLog = {
  title: string;
  points: number;
  date: Date;
};

// Firestore構造想定: users/{uid}/points/{autoId}
// { title: "イベント参加特典", points: 10, date: Timestamp }

const MOCK_LOGS: PointLog[] = [
  { title: "イベント参加特典", points: 10, date: new Date("2024-01-20") },
  { title: "イベント参加特典", points: 10, date: new Date("2024-01-19") },
  { title: "イベント参加特典", points: 10, date: new Date("2024-01-18") },
  { title: "イベント参加特典", points: 10, date: new Date("2024-01-17") },
  { title: "イベント参加特典", points: 10, date: new Date("2024-01-16") },
];

const PointsPage: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setLogs(MOCK_LOGS);
        setTotal(50);
        setLoading(false);
        return;
      }
      setUid(user.uid);

      try {
        const q = query(
          collection(db, "users", user.uid, "points"),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          setLogs(MOCK_LOGS);
          setTotal(50);
        } else {
          const arr: PointLog[] = snap.docs.map((d) => {
            const data = d.data() as {
              title: string;
              points: number;
              date: any;
            };
            return {
              title: data.title,
              points: data.points,
              date: data.date.toDate(),
            };
          });
          setLogs(arr);
          const sum = arr.reduce((s, l) => s + l.points, 0);
          setTotal(sum);
        }
      } catch {
        setLogs(MOCK_LOGS);
        setTotal(50);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">獲得ポイント</h1>
        </div>
      </header>

      {/* メイン */}
      <main className="px-4 pb-24">
        {/* 残高カード */}
        <section className="mt-4">
          <div className="rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-sm font-medium text-slate-600">
              GETSETポイント
            </div>
            <div className="mt-1 text-3xl font-bold text-slate-800">
              {total} <span className="text-base font-medium">P</span>
            </div>
          </div>
          <div className="mt-3 text-sm font-medium text-sky-600">
            使う・交換する
          </div>
        </section>

        {/* 履歴 */}
        <section className="mt-6">
          <div className="text-sm font-semibold text-slate-700">履歴</div>
          {loading ? (
            <div className="py-6 text-center text-slate-400 text-sm">
              読み込み中…
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200">
              {logs.map((l, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-800">{l.title}</span>
                    <span className="text-xs text-slate-500">
                      {format(l.date, "yyyy/MM/dd", { locale: ja })}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {l.points}P
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default PointsPage;
