// src/pages/admin/pages/AdminSettings.tsx
import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Loader2, Info } from "lucide-react";

// Firestoreに保存する設定データの型
interface SystemConfig {
  defaultRecoveryLevel: number;
  maxRechargeSlots: number;
  notificationEmail: string;
  isMaintenanceMode: boolean;
  onboardingActive: boolean;
}

const configRef = doc(db, "system", "config");

const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    defaultRecoveryLevel: 3,
    maxRechargeSlots: 3,
    notificationEmail: "admin@getset.app",
    isMaintenanceMode: false,
    onboardingActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // データの取得
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(configRef);
        if (snap.exists()) {
          setConfig((prev) => ({ ...prev, ...(snap.data() as SystemConfig) }));
        }
      } catch (e) {
        console.error("設定の読み込みに失敗:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // データの保存
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(configRef, config, { merge: true });
      setLastSaved(new Date().toLocaleTimeString());
      alert("設定を保存しました。");
    } catch (e) {
      console.error("設定の保存に失敗:", e);
      alert("設定の保存中にエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      newValue = Number(value);
    } else {
      newValue = value;
    }

    setConfig((prev) => ({ ...prev, [name]: newValue }));
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">設定を読み込み中...</div>
    );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">🛠 システム設定</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-gray-700">
          アプリケーション制御設定
        </h2>

        {/* メンテナンスモード */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <label className="text-base font-medium text-gray-900 flex items-center">
              メンテナンスモードを有効にする
            </label>
            <p className="text-sm text-gray-500 mt-1">
              有効にすると、管理者以外はアプリにアクセスできなくなります。
            </p>
          </div>
          <input
            type="checkbox"
            name="isMaintenanceMode"
            checked={config.isMaintenanceMode}
            onChange={handleChange}
            className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
          />
        </div>

        {/* オンボーディングの有効化 */}
        <div className="flex items-center justify-between py-4">
          <div>
            <label className="text-base font-medium text-gray-900 flex items-center">
              新規ユーザーのオンボーディングを有効化
            </label>
            <p className="text-sm text-gray-500 mt-1">
              新規登録時にカレンダー連携などの初期設定フローを実行します。
            </p>
          </div>
          <input
            type="checkbox"
            name="onboardingActive"
            checked={config.onboardingActive}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-gray-700">
          リチャージ提案のデフォルト設定
        </h2>

        {/* デフォルト回復レベル */}
        <div className="py-4 border-b">
          <label
            className="block text-base font-medium text-gray-900"
            htmlFor="defaultRecoveryLevel"
          >
            デフォルトの活動強度/回復レベル (1-5)
          </label>
          <input
            type="number"
            id="defaultRecoveryLevel"
            name="defaultRecoveryLevel"
            value={config.defaultRecoveryLevel}
            onChange={handleChange}
            min="1"
            max="5"
            className="mt-1 p-2 border border-gray-300 rounded-lg w-20 text-center"
          />
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            新規予定登録時や強度未設定時の初期値として使用されます。
          </p>
        </div>

        {/* 最大提案スロット数 */}
        <div className="py-4">
          <label
            className="block text-base font-medium text-gray-900"
            htmlFor="maxRechargeSlots"
          >
            1日に提案可能なリチャージの最大スロット数
          </label>
          <input
            type="number"
            id="maxRechargeSlots"
            name="maxRechargeSlots"
            value={config.maxRechargeSlots}
            onChange={handleChange}
            min="1"
            max="10"
            className="mt-1 p-2 border border-gray-300 rounded-lg w-20 text-center"
          />
          <p className="text-sm text-gray-500 mt-1">
            一日のリチャージ提案ルールの適用上限回数を制御します。
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-gray-700">
          管理通知設定
        </h2>

        {/* 通知メールアドレス */}
        <div className="py-4">
          <label
            className="block text-base font-medium text-gray-900"
            htmlFor="notificationEmail"
          >
            問い合わせ通知メールアドレス
          </label>
          <input
            type="email"
            id="notificationEmail"
            name="notificationEmail"
            value={config.notificationEmail}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full max-w-sm"
          />
          <p className="text-sm text-gray-500 mt-1">
            ユーザーからの問い合わせが来た際に通知が送信されるアドレスです。
          </p>
        </div>
      </div>

      {/* --- 保存ボタンエリア --- */}
      <div className="pt-4 flex items-center justify-end max-w-2xl">
        {lastSaved && (
          <span className="text-sm text-gray-500 mr-4">
            最終保存: {lastSaved}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              設定を保存
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
