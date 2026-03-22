import React from "react";
import { useNavigate } from "react-router-dom";
import doneImage from "/assets/calendar-done.png";

const ProfileDone: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding/recharges/intro"); // 次のステップへ遷移
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">プロフィール設定</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-5 w-5/6 rounded-full bg-white/40 relative">
            <div className="absolute left-0 top-0 h-5 w-[71%] bg-white rounded-full"></div>
          </div>
          <span className="text-white mt-2 font-semibold">5 / 7</span>
        </div>

        <p className="text-white text-lg font-bold text-center mb-4">
          プロフィール設定は
          <br />
          完了しました
        </p>

        <img src={doneImage} alt="done" className="mx-auto mb-4 max-h-64" />

        <p className="text-white text-sm text-center mb-6">
          続いて目標設定を登録していきましょう
        </p>

        <button
          onClick={handleNext}
          className="mt-2 w-full py-3 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProfileDone;
