import React, { useState } from "react";
import { useProgressStore } from "../stores/useProgressStore";

interface SleepInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SleepInputModal: React.FC<SleepInputModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sleepValue, setSleepValue] = useState<number>(0);
  const { setSleepHours } = useProgressStore();

  if (!isOpen) return null;

  const handleSave = () => {
    setSleepHours(sleepValue); // ✅ Store更新
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-2xl shadow-xl w-80 p-6 text-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-center">
          睡眠時間の登録
        </h3>
        <p className="text-sm mb-2 text-center">昨晩は何時間眠れましたか？</p>

        <input
          type="number"
          min={0}
          max={12}
          step={0.5}
          value={sleepValue}
          onChange={(e) => setSleepValue(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg text-center border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="例：7"
        />

        <div className="flex justify-between mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepInputModal;
