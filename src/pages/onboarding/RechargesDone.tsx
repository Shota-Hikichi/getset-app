import React from "react";
import { useNavigate } from "react-router-dom";

const RechargesDone: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/"); // 任意の完了後ページへ
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">リチャージ登録</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md text-center">
        {/* プログレスバー */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-full bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">7 / 7</span>
        </div>

        <h2 className="text-lg font-bold text-[#0B3142] mb-4">
          リチャージ登録が完了しました
        </h2>
        <img
          src="/assets/recharge-4.png"
          alt="完了イラスト"
          className="w-[70%] mx-auto mb-4"
        />
        <p className="text-[#0B3142] text-sm leading-relaxed">
          おつかれさまでした！
          <br />
          引き続きGETSETをお楽しみください。
        </p>

        <button
          onClick={handleNext}
          className="mt-6 w-full py-3 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition font-semibold"
        >
          Homeへ
        </button>
      </div>
    </div>
  );
};

export default RechargesDone;
