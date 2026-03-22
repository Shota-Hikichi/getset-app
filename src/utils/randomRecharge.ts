// src/utils/randomRecharge.ts

const rechargeCategories = {
  ワークアウト: ["クイックヨガ", "ストレッチ", "自重トレーニング"],
  リフレッシュ: ["瞑想", "音楽を聴く", "自然を眺める"],
  疲労回復: ["15分仮眠", "深呼吸", "目を閉じて休む"],
  考えの整理: ["日記を書く", "散歩しながら考える", "頭の中を整理"],
};

export function getRandomRecharge() {
  const categories = Object.keys(rechargeCategories);
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const titles =
    rechargeCategories[randomCategory as keyof typeof rechargeCategories];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];

  return {
    category: randomCategory,
    title: randomTitle,
  };
}
