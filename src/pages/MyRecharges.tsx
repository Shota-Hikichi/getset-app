// src/pages/MyRecharges.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ChevronDown, ChevronRight } from "lucide-react"; // ▼矢印アイコン
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"; // ▼レーダーチャート用

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
          田中さんの登録リチャージ
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
                    className="border-t pt-3 text-sm text-gray-700 space-y-1"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p>
                      <span className="text-gray-500">提案タイミング：</span>
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
