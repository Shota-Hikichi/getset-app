// src/pages/ProfileSettings.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const ProfileSettings = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    nickname: "ベイシャーウッド",
    age: "26",
    gender: "男",
    industry: "IT",
    job: "ソフトウェアエンジニア",
    income: "7000000",
    role: "PdM",
    prefecture: "北海道",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editKey, setEditKey] = useState<keyof typeof profile | null>(null);
  const [tempValue, setTempValue] = useState("");

  const isUnset = (value: string) => !value || value === "未設定";

  const handleOpenModal = (key: keyof typeof profile) => {
    setEditKey(key);
    setTempValue(profile[key]);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editKey) {
      setProfile((prev) => ({ ...prev, [editKey]: tempValue }));
    }
    setModalOpen(false);
  };

  const inputForKey = (key: keyof typeof profile) => {
    if (key === "gender") {
      return (
        <select
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full"
        >
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="その他">その他</option>
        </select>
      );
    }
    if (key === "age" || key === "income") {
      return (
        <input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full"
        />
      );
    }
    if (key === "prefecture") {
      return (
        <select
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full"
        >
          <option value="">選択してください</option>
          {prefectures.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full"
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b flex items-center">
        <button onClick={() => navigate(-1)} className="text-xl mr-4">
          ←
        </button>
        <h1 className="text-lg font-bold">プロフィール設定</h1>
      </div>

      <div className="p-4 space-y-4">
        {[
          { key: "nickname", label: "ニックネーム" },
          { key: "age", label: "年齢" },
          { key: "gender", label: "性別" },
          { key: "industry", label: "業種" },
          { key: "job", label: "職種" },
          { key: "income", label: "年収" },
          { key: "role", label: "役職" },
          { key: "prefecture", label: "お住まいの都道府県" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-base">
                {item.key === "income"
                  ? `¥${Number(
                      profile[item.key as keyof typeof profile]
                    ).toLocaleString()}`
                  : profile[item.key as keyof typeof profile]}
              </p>
            </div>
            <button
              onClick={() => handleOpenModal(item.key as keyof typeof profile)}
              className={`text-sm ${
                isUnset(profile[item.key as keyof typeof profile])
                  ? "text-green-500"
                  : "text-sky-500"
              }`}
            >
              {isUnset(profile[item.key as keyof typeof profile])
                ? "登録"
                : "編集"}
            </button>
          </div>
        ))}
      </div>

      {/* モーダル */}
      {modalOpen && editKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {
                  [
                    { key: "nickname", label: "ニックネーム" },
                    { key: "age", label: "年齢" },
                    { key: "gender", label: "性別" },
                    { key: "industry", label: "業種" },
                    { key: "job", label: "職種" },
                    { key: "income", label: "年収" },
                    { key: "role", label: "役職" },
                    { key: "prefecture", label: "お住まいの都道府県" },
                  ].find((i) => i.key === editKey)?.label
                }
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* 入力エリア */}
            {inputForKey(editKey)}

            {/* フッターボタン */}
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
