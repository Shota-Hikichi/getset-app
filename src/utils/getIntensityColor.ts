// 1〜5 のレベルに応じて背景色を返す
export const getIntensityColor = (level: number): string => {
  switch (level) {
    case 1:
      return "#7BDFF2"; // 水色
    case 2:
      return "#A7F3D0"; // 薄緑
    case 3:
      return "#FDE68A"; // 黄
    case 4:
      return "#FDBA74"; // 橙
    case 5:
      return "#F87171"; // 赤
    default:
      return "#E5E7EB"; // グレー（デフォルト）
  }
};
