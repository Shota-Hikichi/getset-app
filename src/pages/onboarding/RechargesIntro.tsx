import React from "react";
import { useNavigate } from "react-router-dom";

const RechargeIntro: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding/recharges/tips"); // 次のステップのルート
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">リチャージ登録</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[71%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">6 / 7</span>
        </div>

        <p className="text-black text-xl font-semibold text-center mb-6">
          リチャージとは？
        </p>
        <img
          src="/assets/recharge-1.png"
          alt="Recharge Illustration"
          className="mb-6"
        />

        <p className="text-sm text-black text-center">
          リチャージは、ストレスに対する免疫力をあげたり、ストレスを減らしたりする効果があるもののことです
        </p>

        <button
          type="button"
          onClick={handleNext}
          className="mt-8 w-full py-3 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RechargeIntro;
