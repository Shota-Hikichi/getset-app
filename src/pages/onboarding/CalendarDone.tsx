// src/pages/onboarding/CalendarDone.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

const CalendarDone: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#57B0D9] to-[#E4ECF9] flex flex-col items-center px-4 pt-8">
      <h1 className="text-white text-2xl font-bold mb-4">カレンダー連携</h1>

      <div className="bg-white/30 backdrop-blur-md rounded-[30px] shadow-lg p-6 w-full max-w-md flex flex-col items-center">
        <div className="h-5 w-5/6 rounded-full bg-white/40 relative mb-4">
          <div className="absolute left-0 top-0 h-5 w-[71.4%] bg-white rounded-full"></div>
        </div>
        <span className="text-white font-semibold mb-6">5 / 7</span>

        <img
          src="/assets/calendar-done.png"
          alt="Calendar Done"
          className="w-[200px] h-auto mb-6"
        />

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          カレンダー連携は完了しました
        </h2>
        <p className="text-gray-700 text-sm text-center mb-6">
          続いてプロフィールを登録していきましょう
        </p>

        <button
          className="bg-white text-gray-800 font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-100 transition"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CalendarDone;
