// src/pages/onboarding/RechargesTips.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const RechargesTips: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/register-recharges-point");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">リチャージ登録</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[70%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">6 / 7</span>
        </div>

        <p className="text-center text-lg font-bold text-black mb-4">
          何が効果的なリチャージか？
        </p>

        <img
          src="/assets/recharge-2.png"
          alt="Recharge Tip"
          className="mx-auto mb-6 max-h-60"
        />

        <p className="text-sm text-black text-center mb-6">
          自分がどんなリチャージで、どれくらい元気になるかを把握し、状況に応じて適切なリチャージを選ぶことがポイントです
        </p>

        <button
          type="button"
          onClick={handleNext}
          className="mt-4 w-full py-3 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RechargesTips;
