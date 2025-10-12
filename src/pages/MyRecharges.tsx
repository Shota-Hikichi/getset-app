// src/pages/MyRecharges.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ChevronDown, ChevronRight, Pencil, Check, X } from "lucide-react"; // ▼編集関連アイコンを追加
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useProfileStore } from "../stores/useProfileStore";

type Recharge = {
  id: string;
  title: string;
  category: string;
  duration: number;
  recovery: number;
  recommendedTime: string;
};

const categoryLabels: Record<string, string> = {
  workout: "ワークアウト💪",
  refresh: "リフレッシュ🍀",
  recovery: "疲労回復💖",
  organize: "考えや感情の整理🧠",
  prep: "準備・対策📦",
  sleep: "睡眠😴",
};

const MyRecharges: React.FC = () => {
  const navigate = useNavigate();
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const nickname = useProfileStore((s) => s.nickname);

  // ✅ 編集機能のためのStateを追加
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Recharge> | null>(
    null
  );

  // ✅ Firestoreからユーザーの登録リチャージを取得
  useEffect(() => {
    const fetchRecharges = async () => {
      const q = query(
        collection(db, "recharges"),
        where("published", "==", true)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recharge[];
      setRecharges(data);
    };
    fetchRecharges();
  }, []);

  // ✅ カテゴリ別グループ化
  const grouped = recharges.reduce((acc: Record<string, Recharge[]>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // ✅ レーダーチャート用データ
  const radarData = Object.keys(grouped).map((key) => ({
    category: categoryLabels[key] || key,
    value: grouped[key].reduce((sum, i) => sum + i.recovery, 0),
  }));

  // ✅ 編集開始ハンドラ
  const handleEditClick = (item: Recharge) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  // ✅ 編集キャンセルハンドラ
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  // ✅ フォーム入力ハンドラ
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const finalValue =
      name === "duration" || name === "recovery" ? Number(value) : value;
    setEditingData((prev) => (prev ? { ...prev, [name]: finalValue } : null));
  };

  // ✅ 保存ハンドラ
  const handleSaveEdit = async () => {
    if (!editingId || !editingData) return;

    try {
      const docRef = doc(db, "recharges", editingId);
      // idは更新データに含めない
      const { id, ...dataToUpdate } = editingData;
      await updateDoc(docRef, dataToUpdate);

      // ローカルのstateを更新して即時反映
      setRecharges((prevRecharges) =>
        prevRecharges.map((r) =>
          r.id === editingId ? { ...r, ...editingData } : r
        )
      );

      // 編集モードを終了
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("更新に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="flex items-center p-4 border-b bg-white shadow-sm">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          リチャージの管理
        </h1>
      </div>

      {/* 登録リチャージ概要 */}
      <div className="text-center mt-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          {nickname
            ? `${nickname}さんの登録リチャージ`
            : "あなたの登録リチャージ"}
        </h2>
        <div className="w-full h-64 px-6">
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <Radar
                name="リチャージ"
                dataKey="value"
                stroke="#4A90E2"
                fill="#4A90E2"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* カテゴリ別一覧 */}
      <div className="mt-4 px-4">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          カテゴリー別登録リチャージ一覧
        </h3>
        {Object.keys(grouped).map((key) => (
          <div key={key} className="mb-4 bg-white rounded-xl shadow p-4">
            <button
              onClick={() =>
                setExpandedCategory(expandedCategory === key ? null : key)
              }
              className="flex justify-between items-center w-full text-left"
            >
              <span className="font-bold text-gray-800">
                {categoryLabels[key] || key}
              </span>
              {expandedCategory === key ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedCategory === key && (
              <div className="mt-3 space-y-3">
                {grouped[key].map((item) => (
                  <div
                    key={item.id}
                    className="border-t pt-3 text-sm text-gray-700 space-y-2"
                  >
                    {/* ✅ 編集モードか表示モードかでレンダリングを切り替え */}
                    {editingId === item.id && editingData ? (
                      // 編集モード
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="title"
                          value={editingData.title || ""}
                          onChange={handleInputChange}
                          className="w-full p-1 border rounded"
                          placeholder="タイトル"
                        />
                        <input
                          type="text"
                          name="recommendedTime"
                          value={editingData.recommendedTime || ""}
                          onChange={handleInputChange}
                          className="w-full p-1 border rounded"
                          placeholder="提案タイミング"
                        />
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-500">回復量:</span>
                          <input
                            type="number"
                            name="recovery"
                            value={editingData.recovery || 0}
                            onChange={handleInputChange}
                            className="w-20 p-1 border rounded"
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-500">所要時間:</span>
                          <input
                            type="number"
                            name="duration"
                            value={editingData.duration || 0}
                            onChange={handleInputChange}
                            className="w-20 p-1 border rounded"
                          />
                          <span className="ml-2">分</span>
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
                          <button onClick={handleCancelEdit}>
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                          <button onClick={handleSaveEdit}>
                            <Check className="w-5 h-5 text-green-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 表示モード
                      <div>
                        <div className="flex justify-between items-start">
                          <p className="font-semibold">{item.title}</p>
                          <button onClick={() => handleEditClick(item)}>
                            <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                          </button>
                        </div>
                        <p>
                          <span className="text-gray-500">
                            提案タイミング：
                          </span>
                          {item.recommendedTime}
                        </p>
                        <p>
                          <span className="text-gray-500">回復量：</span>
                          {item.recovery}
                        </p>
                        <p>
                          <span className="text-gray-500">所要時間：</span>
                          {item.duration}分
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRecharges;
