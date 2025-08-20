import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      {/* タイトル */}
      <h1 className="text-white text-2xl font-bold mb-4">GETSETへようこそ</h1>

      {/* カード全体 */}
      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        {/* ステップバー */}
        <div className="flex flex-col items-center mb-4">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[14.2%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">1 / 7</span>
        </div>

        {/* イラスト */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/welcome-illustration.jpg"
            alt="Welcome"
            className="w-[180px] h-auto"
          />
        </div>

        {/* テキストボックス */}
        <div className="bg-white/40 rounded-2xl shadow-md p-4 text-gray-700 text-sm leading-relaxed">
          <p className="mb-2 font-semibold">GETSETへようこそ！</p>
          <p className="mb-2">
            GETSETは、予定を色付けして、予定による負荷の量を明確化し、その負荷から回復をするプランを自動で提案するカレンダーです。
          </p>
          <p className="mb-2">
            高いプレッシャーを生きる中、様々な種類の疲れやストレスをコントロールすることで、より高いパフォーマンスを発揮できます。
          </p>
          <p>さあ、GETSETを使って、いつもGETSETな状態を目指しましょう！</p>
        </div>
      </div>

      {/* Nextボタン */}
      <button
        onClick={handleNext}
        className="mt-8 mb-10 bg-white text-gray-800 font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-100 transition"
      >
        Next
      </button>
    </div>
  );
};

export default Welcome;
