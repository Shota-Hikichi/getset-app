// src/pages/admin/pages/NewsManager.tsx
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
import { Pencil, Trash2, Check, X } from "lucide-react";

type TagColor = "green" | "blue" | "red" | "gray";

interface NewsTag {
  label: string;
  color: TagColor;
}

interface NewsItem {
  id: string;
  title: string;
  body: string;
  tags: NewsTag[];
  date: string;
  published: boolean;
}

const COLOR_OPTIONS: { value: TagColor; label: string; cls: string }[] = [
  { value: "green", label: "緑", cls: "bg-teal-500" },
  { value: "blue", label: "青", cls: "bg-sky-400" },
  { value: "red", label: "赤", cls: "bg-rose-500" },
  { value: "gray", label: "グレー", cls: "bg-slate-400" },
];

const TAG_COLOR_MAP: Record<TagColor, string> = {
  green: "bg-teal-100 text-teal-700",
  blue: "bg-sky-100 text-sky-700",
  red: "bg-rose-100 text-rose-700",
  gray: "bg-slate-100 text-slate-600",
};

const today = () => new Date().toLocaleDateString("ja-JP").replace(/\//g, "/");

const EMPTY_FORM = {
  title: "",
  body: "",
  tags: [] as NewsTag[],
  date: today(),
  published: true,
};

const NewsManager: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState<TagColor>("blue");

  const fetchItems = async () => {
    setLoading(true);
    try {
      // orderBy を使わずシンプルに全件取得（インデックス不要）
      const snap = await getDocs(collection(db, "news"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsItem[];
      // クライアント側で日付降順ソート
      list.sort((a, b) => (b.date > a.date ? 1 : -1));
      setItems(list);
    } catch (e: any) {
      console.error("お知らせ一覧取得エラー:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addTag = () => {
    const label = tagInput.trim();
    if (!label) return;
    const formatted = label.startsWith("#") ? label : `#${label}`;
    setForm((f) => ({ ...f, tags: [...f.tags, { label: formatted, color: tagColor }] }));
    setTagInput("");
  };

  const removeTag = (index: number) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("タイトルは必須です。");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      title: form.title,
      body: form.body,
      tags: form.tags,
      date: form.date,
      published: form.published,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "news", editingId), payload);
      } else {
        // serverTimestamp を使わず通常の値で保存（インデックス・権限問題を回避）
        await addDoc(collection(db, "news"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      setTagInput("");
      await fetchItems();
    } catch (e: any) {
      console.error("保存エラー:", e);
      const msg = e?.code === "permission-denied"
        ? "Firestoreの書き込み権限がありません。セキュリティルールを確認してください。"
        : `保存に失敗しました: ${e?.message ?? e}`;
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setForm({
      title: item.title,
      body: item.body,
      tags: item.tags ?? [],
      date: item.date,
      published: item.published,
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このお知らせを削除しますか？")) return;
    await deleteDoc(doc(db, "news", id));
    fetchItems();
  };

  const togglePublished = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "news", id), { published: !current });
    fetchItems();
  };

  const cancelEdit = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setTagInput("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">お知らせ管理</h1>

      {/* 追加・編集フォーム */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingId ? "✏️ 編集中" : "＋ 新規追加"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">タイトル *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="お知らせのタイトル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">本文</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="お知らせの本文を入力してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">タグ</label>
          <div className="flex gap-2 mb-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="タグ名（例: アンケート）"
            />
            <select
              value={tagColor}
              onChange={(e) => setTagColor(e.target.value as TagColor)}
              className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map((tag, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_COLOR_MAP[tag.color]}`}
              >
                {tag.label}
                <button onClick={() => removeTag(i)} className="hover:opacity-70">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">日付</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 2025/01/17"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-blue-500"
              />
              公開する
            </label>
          </div>
        </div>

        {saveError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            ⚠️ {saveError}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
          >
            <Check size={16} />
            {saving ? "保存中..." : editingId ? "更新する" : "追加する"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            >
              <X size={16} />
              キャンセル
            </button>
          )}
        </div>
      </section>

      {/* 一覧 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            お知らせ一覧 <span className="text-sm font-normal text-gray-400">（{items.length}件）</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">お知らせはありません</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {(item.tags ?? []).map((tag, i) => (
                      <span
                        key={i}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TAG_COLOR_MAP[tag.color]}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">{item.date}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        item.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.published ? "公開中" : "非公開"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  {item.body && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.body}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => togglePublished(item.id, item.published)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    {item.published ? "非公開に" : "公開に"}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsManager;
