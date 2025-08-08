import React from "react";

interface GuidanceCardProps {
  step: {
    title: string;
    message: string;
  };
  onNext: () => void;
  onPrev: () => void;
}

const GuidanceCard: React.FC<GuidanceCardProps> = ({
  step,
  onNext,
  onPrev,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-2">{step.title}</h2>
        <p className="mb-4 text-gray-700">{step.message}</p>
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            disabled={step.title.startsWith("ステップ 1")}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            戻る
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            次へ進む
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidanceCard;
