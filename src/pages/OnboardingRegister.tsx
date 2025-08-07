import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    // バリデーションなど後で追加可能
    console.log({ email, password, confirmPassword });
    navigate("/integration-calendar");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">GETSETに登録</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[28.5%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">2 / 7</span>
        </div>

        <div className="text-white text-sm mb-6">
          ご入力いただいたメールアドレス宛に、確認メールをお送りします。
        </div>

        <div className="space-y-4 mb-8">
          <input
            type="email"
            placeholder="example@company.com"
            className="w-full p-3 rounded-xl bg-white/80 placeholder-gray-500 text-gray-800 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="パスワード"
            className="w-full p-3 rounded-xl bg-white/80 placeholder-gray-500 text-gray-800 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="パスワード確認用"
            className="w-full p-3 rounded-xl bg-white/80 placeholder-gray-500 text-gray-800 focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <p className="text-xs text-white mb-6">
          既にアカウントをお持ちですか？ <a href="#" className="text-blue-800 underline">ログイン</a><br />
          登録すると、<a href="#" className="text-blue-800 underline">プライバシーポリシー</a>に同意したものとみなします。
        </p>

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/")}
            className="bg-white px-6 py-2 rounded-full shadow font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-white px-6 py-2 rounded-full shadow font-semibold"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;