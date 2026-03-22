// src/pages/admin/pages/RechargeArticles.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

type Article = {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  published: boolean;
};

const RechargeArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArticle, setNewArticle] = useState<Omit<Article, "id">>({
    title: "",
    description: "",
    duration: "",
    category: "",
    thumbnail: "",
    published: true,
  });

  // Firestoreから記事一覧を取得
  const fetchArticles = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "recharge_articles"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Article[];
    setArticles(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 新規記事追加
  const handleAdd = async () => {
    if (!newArticle.title || !newArticle.category) {
      alert("タイトルとカテゴリーは必須です。");
      return;
    }
    await addDoc(collection(db, "recharge_articles"), newArticle);
    alert("記事を追加しました！");
    setNewArticle({
      title: "",
      description: "",
      duration: "",
      category: "",
      thumbnail: "",
      published: true,
    });
    fetchArticles();
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm("この記事を削除しますか？")) return;
    await deleteDoc(doc(db, "recharge_articles", id));
    alert("削除しました。");
    fetchArticles();
  };

  // 公開・非公開切り替え
  const togglePublished = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "recharge_articles", id), {
      published: !current,
    });
    fetchArticles();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📰 リチャージ記事管理</h1>

      {/* 新規追加フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <input
          placeholder="タイトル"
          value={newArticle.title}
          onChange={(e) =>
            setNewArticle({ ...newArticle, title: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="カテゴリー（例：workout）"
          value={newArticle.category}
          onChange={(e) =>
            setNewArticle({ ...newArticle, category: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="所要時間（例：20min）"
          value={newArticle.duration}
          onChange={(e) =>
            setNewArticle({ ...newArticle, duration: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="サムネイルURL"
          value={newArticle.thumbnail}
          onChange={(e) =>
            setNewArticle({ ...newArticle, thumbnail: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
        <textarea
          placeholder="説明文"
          value={newArticle.description}
          onChange={(e) =>
            setNewArticle({ ...newArticle, description: e.target.value })
          }
          className="border p-2 rounded w-full md:col-span-2"
        />
        <button
          onClick={handleAdd}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded w-full md:col-span-2"
        >
          ＋ 追加する
        </button>
      </div>

      {/* 記事一覧テーブル */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">タイトル</th>
              <th className="p-2">カテゴリー</th>
              <th className="p-2">所要時間</th>
              <th className="p-2">公開</th>
              <th className="p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{a.title}</td>
                <td className="p-2 text-center">{a.category}</td>
                <td className="p-2 text-center">{a.duration}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => togglePublished(a.id, a.published)}
                    className={`px-2 py-1 rounded text-xs ${
                      a.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {a.published ? "公開中" : "非公開"}
                  </button>
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-rose-600 hover:underline text-sm"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RechargeArticles;
