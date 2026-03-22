import { db } from "../lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function addTimeZoneToAllRecharges() {
  const snap = await getDocs(collection(db, "recharges"));
  for (const d of snap.docs) {
    const data = d.data();
    if (!data.timeZone) {
      // 🔹 すでにフィールドがない場合のみ追加
      await updateDoc(doc(db, "recharges", d.id), {
        timeZone: "during", // 初期値（仮）
      });
      console.log(`✅ updated: ${d.id}`);
    }
  }
  console.log("✅ 全リチャージに timeZone フィールド追加完了");
}
