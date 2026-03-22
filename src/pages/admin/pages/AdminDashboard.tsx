// src/pages/admin/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Users,
  Zap,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// --- モックデータ (実際のデータはFirebaseから取得する必要があります) ---
const KPI_MOCK = {
  activeUsers: 0, // Firestoreのデータで上書き
  completionRate: "78%", // モック
  avgBalanceScore: 72.5, // モック
  totalUsers: 0, // Firestoreから取得
  unpublishedArticles: 0, // Firestoreから取得
  totalRules: 0, // Firestoreから取得
};

// 💡 グラフデータは集計ロジックが複雑なため、今回はモックのまま利用
const WEEKLY_COMPLETION = [
  { name: "月", 完了率: 75, 提案数: 100 },
  { name: "火", 完了率: 68, 提案数: 95 },
  { name: "水", 完了率: 82, 提案数: 110 },
  { name: "木", 完了率: 70, 提案数: 98 },
  { name: "金", 完了率: 88, 提案数: 105 },
  { name: "土", 完了率: 95, 提案数: 70 },
  { name: "日", 完了率: 90, 提案数: 65 },
];

const CATEGORY_DATA = [
  { name: "疲労回復💖", value: 300, color: "#FDE68A" },
  { name: "ワークアウト💪", value: 240, color: "#F87171" },
  { name: "考えの整理🧠", value: 139, color: "#4A90E2" },
  { name: "リフレッシュ🍀", value: 200, color: "#A7F3D0" },
];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState(KPI_MOCK);
  const [loading, setLoading] = useState(true);

  // 1. Firebaseからのデータ取得ロジック
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const updates: Partial<typeof KPI_MOCK> = {};

      try {
        // 1. ユーザー総数 (userProfilesコレクションのドキュメント数をカウント)
        const userSnap = await getDocs(collection(db, "userProfiles"));
        updates.totalUsers = userSnap.size;

        // 2. リチャージルール総数の取得
        const ruleSnap = await getDocs(collection(db, "rechargeRules"));
        updates.totalRules = ruleSnap.size;

        // 3. 未公開リチャージ記事数の取得
        const articleQuery = query(
          collection(db, "recharge_articles"),
          where("published", "==", false)
        );
        const articleSnap = await getDocs(articleQuery);
        updates.unpublishedArticles = articleSnap.size;

        // ユーザー総数をアクティブユーザーとして代用して表示
        setData((prev) => ({
          ...prev,
          ...updates,
          activeUsers: updates.totalUsers ?? prev.activeUsers,
        }));
      } catch (e) {
        console.error("Firebaseデータ取得エラー:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. 表示用KPIデータの再構築
  const KPI_DISPLAY_DATA = [
    {
      icon: Users,
      label: "ユーザー総数",
      value: loading ? "..." : data.totalUsers,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: Zap,
      label: "アクティブユーザー (総数)",
      value: loading ? "..." : data.activeUsers,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: CheckCircle,
      label: "リチャージ完了率 (モック)",
      value: loading ? "..." : data.completionRate,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      icon: TrendingUp,
      label: "平均バランス指数 (モック)",
      value: loading ? "..." : data.avgBalanceScore,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>

      {loading && (
        <p className="text-center text-gray-500">データを読み込み中...</p>
      )}

      {/* --- 1. KPIサマリーカード --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_DISPLAY_DATA.map((kpi, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-full ${kpi.bgColor} ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. メインチャートエリア (棒グラフ & 円グラフ) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2.1. 週別リチャージ完了率 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            週次のリチャージ完了率 (モック)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={WEEKLY_COMPLETION}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e0e0e0"
              />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#3b82f6"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "完了率" ? "完了率 (%)" : "提案数",
                ]}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="完了率"
                fill="#3b82f6"
                name="完了率 (%)"
              />
              <Bar
                yAxisId="right"
                dataKey="提案数"
                fill="#f59e0b"
                name="提案数"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2.2. カテゴリー別利用内訳 (円グラフ) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            カテゴリー別利用内訳 (モック)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              {/* 凡例の位置を修正: 右側中央から下部中央に変更 */}
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- 3. システム健全性 & ToDo (テーブル) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3.1. システム健全性チェック */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            システム健全性
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex justify-between items-center border-b pb-2">
              <span>Firebase接続ステータス</span>
              <span className="font-medium text-green-600">正常</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>リチャージルール総数</span>
              <span className="font-medium">
                {loading ? "..." : `${data.totalRules} 件`}
              </span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>Google連携トークンエラー (モック)</span>
              <span className="font-medium text-red-500">2 件</span>
            </li>
            <li className="flex justify-between items-center">
              <span>未公開リチャージ記事</span>
              <span className="font-medium text-red-500">
                {loading ? "..." : `${data.unpublishedArticles} 件`}
              </span>
            </li>
          </ul>
        </div>

        {/* 3.2. 管理者タスクリスト */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            管理者タスク (モック)
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex justify-between items-center border-b pb-2">
              <span>未対応のお問い合わせ</span>
              <span className="font-medium text-red-500">1 件</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>新規リチャージルールのテスト</span>
              <span className="font-medium text-orange-500">要実施</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>来月のイベント告知記事作成</span>
              <span className="font-medium text-gray-400">完了</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
