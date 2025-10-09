// src/pages/admin/RechargeRuleManager.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { RechargeRule } from "../../../types/rechargeRule";

const RechargeRuleManager: React.FC = () => {
  const [rules, setRules] = useState<RechargeRule[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Firestore からルール取得
  useEffect(() => {
    const fetchRules = async () => {
      const snap = await getDocs(collection(db, "rechargeRules"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as RechargeRule),
      }));
      setRules(data);
      setLoading(false);
    };
    fetchRules();
  }, []);

  // ✅ 保存
  const handleSave = async (rule: RechargeRule) => {
    const payload = {
      ...rule,
      updatedAt: new Date().toISOString(),
    };

    if (rule.id) {
      await updateDoc(doc(db, "rechargeRules", rule.id), payload);
    } else {
      await addDoc(collection(db, "rechargeRules"), payload);
    }
    alert("保存しました ✅");
  };

  // ✅ 削除
  const handleDelete = async (id: string) => {
    if (confirm("このルールを削除しますか？")) {
      await deleteDoc(doc(db, "rechargeRules", id));
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // ✅ 新規追加
  const handleAdd = () => {
    setRules((prev) => [
      ...prev,
      {
        dayType: "workday",
        timeZone: "during",
        timing: "morning",
        slot: 1,
        priority: 3,
        duration: "30分",
        note: "",
        active: true,
        minRecovery: 1,
        maxRecovery: 5,
        minDuration: 5,
        maxDuration: 60,
        sortBy: "recovery",
        sortOrder: "desc",
        // 🔹 新規追加：初期値
        categories: ["ワークアウト"],
      },
    ]);
  };

  if (loading) return <div className="p-4">読み込み中...</div>;

  // ========================== JSX ==========================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">リチャージ提案ルール管理</h1>
      <p className="text-gray-600 text-sm">
        提案の時間帯や回復量・所要時間などを調整できます。
        <br />
        ※変更は自動的にユーザーアプリのリチャージ提案に反映されます。
      </p>

      {/* 新規追加ボタン */}
      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        ＋ 新しいルールを追加
      </button>

      <div className="grid gap-4">
        {rules.map((r, idx) => (
          <div
            key={r.id || idx}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4"
          >
            {/* ======= 基本情報 ======= */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* 日種別 */}
              <div>
                <label className="text-sm text-gray-600">日種別</label>
                <select
                  value={r.dayType}
                  onChange={(e) =>
                    setRules((prev) =>
                      prev.map((rr, i) =>
                        i === idx
                          ? { ...rr, dayType: e.target.value as any }
                          : rr
                      )
                    )
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="workday">就業日</option>
                  <option value="holiday">休日</option>
                </select>
              </div>

              {/* 提案タイミング */}
              <div>
                <label className="text-sm text-gray-600">時間帯</label>
                <select
                  value={r.timeZone || "during"}
                  onChange={(e) =>
                    setRules(
                      (prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? ({
                                ...rr,
                                timeZone: e.target.value,
                              } as RechargeRule)
                            : rr
                        ) as RechargeRule[]
                    )
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="morning">朝（就業前）</option>
                  <option value="during">昼（就業中）</option>
                  <option value="after">夜（就業後）</option>
                </select>
              </div>

              {/* スロット */}
              <div>
                <label className="text-sm text-gray-600">スロット</label>
                <input
                  type="number"
                  min="1"
                  value={r.slot}
                  onChange={(e) =>
                    setRules((prev) =>
                      prev.map((rr, i) =>
                        i === idx ? { ...rr, slot: Number(e.target.value) } : rr
                      )
                    )
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              {/* 優先度 */}
              <div>
                <label className="text-sm text-gray-600">優先度</label>
                <input
                  type="number"
                  value={r.priority}
                  onChange={(e) =>
                    setRules((prev) =>
                      prev.map((rr, i) =>
                        i === idx
                          ? { ...rr, priority: Number(e.target.value) }
                          : rr
                      )
                    )
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>

            {/* 🔹 カテゴリー選択 */}
            <div>
              <label className="text-sm text-gray-600">適用カテゴリー</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  "ワークアウト",
                  "リフレッシュ",
                  "疲労回復",
                  "考えの整理",
                  "準備・対策",
                ].map((cat) => {
                  const isSelected = r.categories?.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        setRules((prev) =>
                          prev.map((rr, i) =>
                            i === idx
                              ? {
                                  ...rr,
                                  categories: isSelected
                                    ? rr.categories?.filter((c) => c !== cat)
                                    : [...(rr.categories ?? []), cat],
                                }
                              : rr
                          )
                        )
                      }
                      className={`px-3 py-1 rounded-full border text-sm transition ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      }`}
                      type="button"
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ======= 条件設定 ======= */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t pt-4">
              {/* 回復量 */}
              <div>
                <label className="text-sm text-gray-600">回復量の範囲</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={r.minRecovery ?? 1}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? { ...rr, minRecovery: Number(e.target.value) }
                            : rr
                        )
                      )
                    }
                    className="w-1/2 border rounded-lg p-2"
                  />
                  <input
                    type="number"
                    value={r.maxRecovery ?? 5}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? { ...rr, maxRecovery: Number(e.target.value) }
                            : rr
                        )
                      )
                    }
                    className="w-1/2 border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* 所要時間 */}
              <div>
                <label className="text-sm text-gray-600">所要時間（分）</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={r.minDuration ?? 5}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? { ...rr, minDuration: Number(e.target.value) }
                            : rr
                        )
                      )
                    }
                    className="w-1/2 border rounded-lg p-2"
                  />
                  <input
                    type="number"
                    value={r.maxDuration ?? 60}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? { ...rr, maxDuration: Number(e.target.value) }
                            : rr
                        )
                      )
                    }
                    className="w-1/2 border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* 並び順設定 */}
              <div>
                <label className="text-sm text-gray-600">並び替え基準</label>
                <div className="flex gap-2">
                  <select
                    value={r.sortBy || "recovery"}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? ({
                                ...rr,
                                sortBy: e.target.value as
                                  | "recovery"
                                  | "duration",
                              } as RechargeRule)
                            : rr
                        )
                      )
                    }
                    className="w-2/3 border rounded-lg p-2"
                  >
                    <option value="recovery">回復量</option>
                    <option value="duration">所要時間</option>
                  </select>

                  <select
                    value={r.sortOrder || "desc"}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((rr, i) =>
                          i === idx
                            ? ({
                                ...rr,
                                sortOrder: e.target.value as "asc" | "desc",
                              } as RechargeRule)
                            : rr
                        )
                      )
                    }
                    className="w-1/3 border rounded-lg p-2"
                  >
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ======= 有効フラグ・補足 ======= */}
            <div className="flex items-center gap-2 pt-3">
              <label className="text-sm text-gray-600">有効</label>
              <input
                type="checkbox"
                checked={r.active}
                onChange={(e) =>
                  setRules((prev) =>
                    prev.map((rr, i) =>
                      i === idx ? { ...rr, active: e.target.checked } : rr
                    )
                  )
                }
                className="h-5 w-5"
              />
            </div>

            <textarea
              value={r.note}
              onChange={(e) =>
                setRules((prev) =>
                  prev.map((rr, i) =>
                    i === idx ? { ...rr, note: e.target.value } : rr
                  )
                )
              }
              placeholder="補足メモ（例：昼は短時間を優先）"
              className="w-full border rounded-lg p-2 mt-3 text-sm"
            />

            {/* ======= 保存・削除 ======= */}
            <div className="flex justify-end gap-3 mt-3 border-t pt-3">
              <button
                onClick={() => handleSave(r)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                保存
              </button>
              {r.id && (
                <button
                  onClick={() => handleDelete(r.id!)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RechargeRuleManager;
