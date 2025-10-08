import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import AdminLayout from "./AdminLayout";
import { Pencil, Trash2, Save, X } from "lucide-react";

type Recharge = {
  id?: string;
  title: string;
  category: string;
  duration: number;
  recovery: number;
  recommendedTime: string;
  published: boolean;
};

const RechargeManager: React.FC = () => {
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Recharge | null>(null);
  const [newRecharge, setNewRecharge] = useState<Recharge>({
    title: "",
    category: "",
    duration: 30,
    recovery: 3,
    recommendedTime: "",
    published: true,
  });

  const fetchRecharges = async () => {
    const snapshot = await getDocs(collection(db, "recharges"));
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Recharge[];
    setRecharges(data);
  };

  useEffect(() => {
    fetchRecharges();
  }, []);

  const handleAdd = async () => {
    if (!newRecharge.title || !newRecharge.category) {
      alert("タイトルとカテゴリーは必須です");
      return;
    }
    await addDoc(collection(db, "recharges"), newRecharge);
    await fetchRecharges();
    setNewRecharge({
      title: "",
      category: "",
      duration: 30,
      recovery: 3,
      recommendedTime: "",
      published: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    await deleteDoc(doc(db, "recharges", id));
    await fetchRecharges();
  };

  const startEditing = (r: Recharge) => {
    setEditingId(r.id || null);
    setEditData({ ...r });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleEditChange = (field: keyof Recharge, value: any) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const saveEdit = async () => {
    if (!editingId || !editData) return;
    const ref = doc(db, "recharges", editingId);
    await updateDoc(ref, editData);
    await fetchRecharges();
    setEditingId(null);
    setEditData(null);
  };

  return (
    <AdminLayout>
      <div className="p-10 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          ⚡ リチャージ管理
        </h1>

        {/* 入力フォーム */}
        <div className="grid grid-cols-6 gap-3 mb-10 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <input
            className="col-span-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg text-sm"
            placeholder="タイトル"
            value={newRecharge.title}
            onChange={(e) =>
              setNewRecharge({ ...newRecharge, title: e.target.value })
            }
          />
          <input
            className="col-span-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg text-sm"
            placeholder="カテゴリー（例：ワークアウト）"
            value={newRecharge.category}
            onChange={(e) =>
              setNewRecharge({ ...newRecharge, category: e.target.value })
            }
          />
          <input
            className="col-span-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg text-sm"
            type="number"
            placeholder="所要時間（分）"
            value={newRecharge.duration}
            onChange={(e) =>
              setNewRecharge({
                ...newRecharge,
                duration: Number(e.target.value),
              })
            }
          />
          <input
            className="col-span-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg text-sm"
            type="number"
            placeholder="回復量（1〜5）"
            value={newRecharge.recovery}
            onChange={(e) =>
              setNewRecharge({
                ...newRecharge,
                recovery: Number(e.target.value),
              })
            }
          />
          <input
            className="col-span-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-lg text-sm"
            placeholder="推奨時間帯（例：15:00〜17:00）"
            value={newRecharge.recommendedTime}
            onChange={(e) =>
              setNewRecharge({
                ...newRecharge,
                recommendedTime: e.target.value,
              })
            }
          />
          <button
            onClick={handleAdd}
            className="col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all shadow-sm"
          >
            追加
          </button>
        </div>

        {/* テーブル */}
        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-white">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">カテゴリー</th>
                <th className="px-4 py-3">時間</th>
                <th className="px-4 py-3">回復量</th>
                <th className="px-4 py-3">推奨時間帯</th>
                <th className="px-4 py-3">公開</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {recharges.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  {editingId === r.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          className="border p-1 rounded w-full"
                          value={editData?.title || ""}
                          onChange={(e) =>
                            handleEditChange("title", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="border p-1 rounded w-full"
                          value={editData?.category || ""}
                          onChange={(e) =>
                            handleEditChange("category", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="border p-1 rounded w-full"
                          value={editData?.duration || 0}
                          onChange={(e) =>
                            handleEditChange("duration", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="border p-1 rounded w-full"
                          value={editData?.recovery || 0}
                          onChange={(e) =>
                            handleEditChange("recovery", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className="border p-1 rounded w-full"
                          value={editData?.recommendedTime || ""}
                          onChange={(e) =>
                            handleEditChange("recommendedTime", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="border p-1 rounded w-full"
                          value={editData?.published ? "true" : "false"}
                          onChange={(e) =>
                            handleEditChange(
                              "published",
                              e.target.value === "true"
                            )
                          }
                        >
                          <option value="true">公開中</option>
                          <option value="false">非公開</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 flex justify-end space-x-2">
                        <button
                          onClick={saveEdit}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>保存</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>キャンセル</span>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{r.title}</td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">{r.duration}分</td>
                      <td className="px-4 py-3">{r.recovery}</td>
                      <td className="px-4 py-3">{r.recommendedTime}</td>
                      <td className="px-4 py-3">
                        {r.published ? (
                          <span className="text-green-600 font-semibold">
                            公開中
                          </span>
                        ) : (
                          <span className="text-gray-400">非公開</span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex justify-end space-x-2">
                        <button
                          onClick={() => startEditing(r)}
                          className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>編集</span>
                        </button>
                        <button
                          onClick={() => handleDelete(r.id!)}
                          className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>削除</span>
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RechargeManager;
