// src/pages/ProfileSettings.tsx
import React, { useEffect, useState } from "react";
import { useProfileStore } from "../stores/useProfileStore";
import { prefectures } from "../utils/prefectures"; // 都道府県リスト
import { auth } from "../lib/firebase"; // Firebase Authをインポート

const ProfileSettings: React.FC = () => {
  const {
    nickname,
    age,
    gender,
    industry,
    jobType,
    income,
    position,
    prefecture,
    setField,
    setNickname,
    saveProfile,
    loadProfile,
  } = useProfileStore();

  const [editingField, setEditingField] = useState<
    keyof ReturnType<typeof useProfileStore.getState> | null
  >(null);
  const [tempValue, setTempValue] = useState("");

  const userId = auth.currentUser?.uid || "demoUser001"; // 👈 修正: 実際のユーザーIDを使用

  // ✅ 修正: 認証ユーザーのUIDを使ってプロフィールをロード
  useEffect(() => {
    if (auth.currentUser) {
      loadProfile(auth.currentUser.uid);
    }
  }, [loadProfile]);

  // 編集モーダルを開く
  const handleEdit = (
    // 👈 修正: 型エラーを避けるため、ProfilePayloadのキー型を直接指定
    field: keyof Omit<
      ReturnType<typeof useProfileStore.getState>,
      "setField" | "setNickname" | "setAvatar" | "saveProfile" | "loadProfile"
    >,
    value?: string
  ) => {
    setEditingField(field);
    setTempValue(value || "");
  };

  // 保存ボタン押下
  const handleSave = async () => {
    if (!editingField || !userId) return;

    try {
      if (editingField === "nickname") {
        setNickname(tempValue);
      } else if (editingField === "avatar") {
        // avatarは文字列として扱う
        setField(editingField as any, tempValue);
      } else {
        // age, income, durationなどは文字列として保存されるので問題ない
        setField(editingField as any, tempValue);
      }

      // ユーザーIDが存在する場合のみ保存を実行
      if (auth.currentUser) {
        await saveProfile(auth.currentUser.uid);
      }

      setEditingField(null);
    } catch (e) {
      console.error("プロフィール保存エラー:", e);
      alert("プロフィールの更新に失敗しました。");
    }
  };

  // 各フィールド行を描画
  const renderField = (
    label: string,
    // 👈 修正: 型エラーを避けるため、ProfilePayloadのキー型を直接指定
    key: keyof Omit<
      ReturnType<typeof useProfileStore.getState>,
      "setField" | "setNickname" | "setAvatar" | "saveProfile" | "loadProfile"
    >
  ) => {
    // ストアの全状態を取得し、動的キーでアクセス
    const state = useProfileStore.getState() as any;
    const value: string | undefined = state[key];

    const isRegistrationField = key === "prefecture" || key === "nickname"; // 登録ボタンを表示するフィールド

    // 値が空で、かつ編集フィールドでもない場合のみ「未設定」を表示
    const displayValue = value || "未設定";

    return (
      <div
        key={String(key)}
        className="flex items-center justify-between px-4 py-4 border-b bg-white"
      >
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-base font-medium text-gray-800">
            {displayValue}
          </div>
        </div>

        {isRegistrationField ? (
          <button
            onClick={() => handleEdit(key, value)}
            className="text-sm text-green-500 font-medium"
          >
            {value ? "編集" : "登録"}
          </button>
        ) : (
          <button
            onClick={() => handleEdit(key, value)}
            className="text-sm text-sky-600 font-medium"
          >
            編集
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-white p-4 border-b text-center font-semibold text-lg">
        プロフィール設定
      </div>

      {/* 各項目 */}
      <div className="divide-y">
        {/* 👈 修正: ストアのフィールド名に合わせる */}
        {renderField("ニックネーム", "nickname")}
        {renderField("年齢", "age")}
        {renderField("性別", "gender")}
        {renderField("業種", "industry")}
        {renderField("職種", "jobType")}
        {renderField("年収", "income")}
        {renderField("役職", "position")}
        {renderField("お住まいの都道府県", "prefecture")}
      </div>

      {/* モーダル */}
      {editingField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 space-y-4 shadow-xl">
            <h2 className="font-semibold text-lg text-center mb-2">
              {editingField === "prefecture"
                ? "お住まいの都道府県を選択"
                : "入力してください"}
            </h2>

            {editingField === "prefecture" ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">選択してください</option>
                {prefectures.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="text-gray-500 text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="text-blue-600 font-semibold text-sm"
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
