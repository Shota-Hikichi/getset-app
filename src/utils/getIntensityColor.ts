// 1〜5 のレベルに応じてアクセントカラーを返す（左ボーダー・インジケーター用）
export const getIntensityColor = (level: number): string => {
  switch (level) {
    case 1:
      return "#38BDF8"; // sky-400（明るめブルー）
    case 2:
      return "#34D399"; // emerald-400（ミントグリーン）
    case 3:
      return "#FBBF24"; // amber-400（黄）
    case 4:
      return "#FB923C"; // orange-400（橙）
    case 5:
      return "#F87171"; // red-400（赤）
    default:
      return "#94A3B8"; // slate-400（グレー）
  }
};
