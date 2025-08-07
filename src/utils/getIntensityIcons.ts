export const getIntensityIcons = (level: number): string[] => {
  const icons: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i === level) {
      icons.push("⚪️"); // 中央の大きな丸
    } else if (i < level) {
      icons.push("🟡"); // 強度が低めの丸
    } else {
      icons.push("⚪︎"); // 空白の丸
    }
  }
  return icons;
};
