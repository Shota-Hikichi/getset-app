// src/pages/onboarding/ProfileSetting.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 👈 修正: Firebaseの認証とFirestore操作に必要なものをインポート
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  // 👈 既存のオプションをそのまま利用
  const ageOptions = ["10代", "20代", "30代", "40代", "50代", "60代以上"];
  const genderOptions = ["男性", "女性", "その他", "回答しない"];
  const occupationOptions = [
    "学生",
    "会社員",
    "自営業",
    "専業主婦・主夫",
    "無職",
    "その他",
  ];
  const livingStatusOptions = ["一人暮らし", "パートナーと同居"];

  const [formData, setFormData] = useState({
    nickname: "",
    ageRange: "", // 👈 name属性に合わせる
    gender: "",
    occupation: "", // 👈 業種として使用
    livingStatus: "",
    sleepTimeStart: "00:00",
    sleepTimeEnd: "00:00",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 👈 修正: 非同期関数に変更し、Firestore保存ロジックを追加
  const handleNext = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("認証情報が見つかりません。再ログインしてください。");
      navigate("/onboarding/register");
      return;
    }

    // 必須項目の簡易バリデーション (クライアント側)
    if (
      !formData.nickname ||
      !formData.ageRange ||
      !formData.gender ||
      !formData.occupation
    ) {
      alert("ニックネーム、年代、性別、業種は必須です。");
      return;
    }

    try {
      // 1. Firestoreの参照をUIDで作成
      const profileRef = doc(db, "userProfiles", user.uid);

      // 2. データをFirestoreに保存（UIDとフォームデータを紐づけ）
      await setDoc(
        profileRef,
        {
          uid: user.uid,
          ...formData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log("✅ Profile saved and linked to UID:", user.uid);

      // 3. 次のステップへ遷移
      navigate("/onboarding/profile-done");
    } catch (e) {
      console.error("❌ Firestoreへのプロフィール保存エラー:", e);
      alert("プロフィールの保存中にエラーが発生しました。");
      // エラー時もとりあえず次の画面へ遷移させる（問題解決のため）
      navigate("/onboarding/profile-done");
    }
  };

  // フォームのonSubmitハンドラを追加してhandleNextを確実に呼び出す
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">プロフィール設定</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[57%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">4 / 7</span>
        </div>

        <p className="text-white text-sm mb-4 text-center">
          個人利用のユーザーとして登録されています
        </p>

        {/* 👈 フォームタグにonSubmitを追加し、ボタンのtypeをsubmitに変更 */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmitForm}>
          <div>
            <label className="text-sm text-white">
              ニックネーム <span className="text-red-500">必須</span>
            </label>
            <input
              type="text"
              name="nickname"
              placeholder="入力してください"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border focus:outline-none"
              required
            />
          </div>

          {/** セレクト系 */}
          {[
            { label: "年代", name: "ageRange", options: ageOptions },
            { label: "性別", name: "gender", options: genderOptions },
            { label: "業種", name: "occupation", options: occupationOptions },
            {
              label: "パートナーと同居 / 一人暮らし",
              name: "livingStatus",
              options: livingStatusOptions,
              optional: true,
            },
          ].map(({ label, name, options, optional }) => (
            <div key={name}>
              <label className="text-sm text-white">
                {label}{" "}
                {optional ? (
                  <span className="text-xs text-white/70">任意</span>
                ) : (
                  <span className="text-red-500">必須</span>
                )}
              </label>
              <select
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full border focus:outline-none"
                required={!optional}
              >
                <option value="">選択してください</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/** 時間帯 */}
          <div>
            <label className="text-sm text-white">
              通常寝ている時間帯{" "}
              <span className="text-xs text-white/70">任意</span>
            </label>
            <p className="text-xs text-white mb-2">
              この時間帯にはリチャージが提案されなくなります
            </p>
            <div className="flex gap-2 items-center">
              <select
                name="sleepTimeStart"
                value={formData.sleepTimeStart}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full border focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                    {`${i.toString().padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
              <span className="text-white">から</span>
              <select
                name="sleepTimeEnd"
                value={formData.sleepTimeEnd}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full border focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                    {`${i.toString().padStart(2, "0")}:00`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit" // 👈 typeをsubmitに変更
            className="mt-6 w-full py-3 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition font-semibold"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
