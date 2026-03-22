// src/pages/TimeSettingsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { auth } from "../lib/firebase";
import {
  useTimeSettingsStore,
  TimePeriod,
} from "../stores/useTimeSettingsStore";

// 時間の選択肢（0〜23時）
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

// 時間セレクトコンポーネント
const HourSelect: React.FC<{
  value: number;
  onChange: (h: number) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-slate-500">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
    >
      {HOURS.map((h) => (
        <option key={h} value={h}>
          {fmtHour(h)}
        </option>
      ))}
    </select>
  </div>
);

// 時間帯設定カードのサブコンポーネント
const PeriodCard: React.FC<{
  title: string;
  description?: string;
  period: TimePeriod;
  onToggle: (enabled: boolean) => void;
  onChangeStart: (h: number) => void;
  onChangeEnd: (h: number) => void;
  wrapNote?: boolean;
}> = ({ title, description, period, onToggle, onChangeStart, onChangeEnd, wrapNote }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[15px] font-medium text-slate-800">{title}</div>
        {description && (
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        )}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={period.enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
      </label>
    </div>

    {period.enabled && (
      <div className="flex gap-4">
        <HourSelect value={period.start} onChange={onChangeStart} label="開始" />
        <HourSelect value={period.end} onChange={onChangeEnd} label="終了" />
        {wrapNote && period.start > period.end && (
          <div className="flex items-end text-xs text-slate-400 pb-2">
            翌日まで
          </div>
        )}
      </div>
    )}
  </div>
);

const TimeSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    commute,
    work,
    sleep,
    workBreakEnabled,
    workBreakSlots,
    isLoaded,
    loadFromFirestore,
    saveToFirestore,
    setPeriod,
    setBreakSlot,
    setWorkBreakEnabled,
  } = useTimeSettingsStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid && !isLoaded) loadFromFirestore(uid);
  }, [isLoaded, loadFromFirestore]);

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      await saveToFirestore(uid);
      navigate(-1);
    } catch {
      alert("保存に失敗しました。再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500 text-sm">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
            aria-label="戻る"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">時間帯設定</h1>
        </div>
      </header>

      <main className="px-4 pb-28 pt-4 space-y-4">
        {/* 注意書き */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          設定した時間帯にはリチャージを提案しません。
          <br />
          通勤時間・勤務時間・就寝時間を登録してください。
        </div>

        {/* 通勤時間 */}
        <PeriodCard
          title="通勤時間"
          description="この時間帯はリチャージを提案しません"
          period={commute}
          onToggle={(enabled) => setPeriod("commute", { enabled })}
          onChangeStart={(start) => setPeriod("commute", { start })}
          onChangeEnd={(end) => setPeriod("commute", { end })}
        />

        {/* 勤務時間 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium text-slate-800">勤務時間</div>
              <div className="text-xs text-slate-500 mt-0.5">
                デフォルト 09:00〜17:00
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={work.enabled}
                onChange={(e) => setPeriod("work", { enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {work.enabled && (
            <>
              <div className="flex gap-4">
                <HourSelect
                  value={work.start}
                  onChange={(start) => setPeriod("work", { start })}
                  label="開始"
                />
                <HourSelect
                  value={work.end}
                  onChange={(end) => setPeriod("work", { end })}
                  label="終了"
                />
              </div>

              {/* 休憩時間の設定 */}
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workBreakEnabled}
                    onChange={(e) => setWorkBreakEnabled(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-700">
                      勤務時間中の休憩時間にリチャージを提案する
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      チェックを外すと勤務時間中は一切提案しません
                    </div>
                  </div>
                </label>

                {workBreakEnabled && (
                  <div className="space-y-2 pl-6">
                    {workBreakSlots.map((slot, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(e) =>
                              setBreakSlot(i, { enabled: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-slate-300 accent-blue-500"
                          />
                          <span className="text-xs text-slate-600 font-medium">
                            休憩枠 {i + 1}
                          </span>
                        </div>
                        {slot.enabled && (
                          <div className="flex gap-3 pl-6">
                            <HourSelect
                              value={slot.start}
                              onChange={(start) => setBreakSlot(i, { start })}
                              label="開始"
                            />
                            <HourSelect
                              value={slot.end}
                              onChange={(end) => setBreakSlot(i, { end })}
                              label="終了"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 就寝時間 */}
        <PeriodCard
          title="就寝時間"
          description="デフォルト 23:00〜07:00（翌日）"
          period={sleep}
          onToggle={(enabled) => setPeriod("sleep", { enabled })}
          onChangeStart={(start) => setPeriod("sleep", { start })}
          onChangeEnd={(end) => setPeriod("sleep", { end })}
          wrapNote
        />

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 py-4 text-white font-semibold text-[15px] hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </main>
    </div>
  );
};

export default TimeSettingsPage;
