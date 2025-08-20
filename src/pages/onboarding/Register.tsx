// src/pages/onboarding/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ★ これが超重要：ページリロードを防ぐ
    // 簡易バリデーション
    if (!email || !pw) return alert("メールとパスワードを入力してください。");
    if (pw !== pw2) return alert("パスワードが一致しません。");

    // TODO: Firebase などでアカウント作成があるならここで実行
    // await createUserWithEmailAndPassword(auth, email, pw);

    // 次のオンボーディングへ
    navigate("/onboarding/integration-calendar");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8 pb-24">
      <h1 className="text-white text-2xl font-bold mb-4">GETSETに登録</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        {/* ステップバーなどは省略可 */}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <input
            type="email"
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 outline-none"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 outline-none"
            required
          />
          <input
            type="password"
            placeholder="パスワード確認用"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 outline-none"
            required
          />

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full bg-white/90 px-6 py-2 text-gray-700 shadow"
            >
              Back
            </button>
            <button
              type="submit" // ★ submit でOK（上で preventDefault 済み）
              className="rounded-full bg-white px-6 py-2 font-semibold text-gray-800 shadow hover:bg-blue-100"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
