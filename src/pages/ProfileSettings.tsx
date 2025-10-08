import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ===== 型 =====
type Profile = {
  nickname?: string;
  age?: number | null;
  gender?: "男" | "女" | "その他" | "未選択";
  industry?: string; // 業種
  job?: string; // 職種
  income?: string; // 年収（表示用 "700万円" など）
  role?: string; // 役職
  prefecture?: string; // 都道府県
  updatedAt?: any;
};

type FieldKey = keyof Omit<Profile, "updatedAt">;

// ===== マスタ（選択肢） =====
const GENDERS: Profile["gender"][] = ["男", "女", "その他", "未選択"];
const PREFECTURES = [
  "未設定",
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const LABELS: Record<FieldKey, string> = {
  nickname: "ニックネーム",
  age: "年齢",
  gender: "性別",
  industry: "業種",
  job: "職種",
  income: "年収",
  role: "役職",
  prefecture: "お住まいの都道府県",
};

// ===== ユーティリティ =====
const formatValue = (k: FieldKey, v: any) => {
  if (v === undefined || v === null || v === "") return "未設定";
  if (k === "age") return `${v}歳`;
  return String(v);
};

// ===== モーダル（このページ専用の軽量実装） =====
type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
};
const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  onSave,
  saving,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 top-[15%] mx-auto max-w-md rounded-2xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-base font-semibold">{title}</div>
        <div className="space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
            disabled={saving}
          >
            キャンセル
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== 画面本体 =====
const ProfileSettings: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({});
  const [error, setError] = useState<string | null>(null);

  // 編集状態
  const [editingKey, setEditingKey] = useState<FieldKey | null>(null);
  const [draft, setDraft] = useState<any>("");
  const [saving, setSaving] = useState(false);

  // 認証→プロフィール取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setLoading(false);
        setError("サインインが必要です。");
        return;
      }
      setUid(user.uid);
      try {
        const ref = doc(db, "users", user.uid, "profile", "main"); // users/{uid}/profile/main
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        } else {
          // 初期ドキュメント作成（存在しない場合）
          await setDoc(ref, { updatedAt: serverTimestamp() });
          setProfile({});
        }
      } catch (e: any) {
        setError(e.message ?? "プロフィールの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // 編集開始
  const startEdit = (key: FieldKey) => {
    setEditingKey(key);
    const current = profile[key];

    // 初期値セット
    if (key === "gender") setDraft((current as string) ?? "未選択");
    else if (key === "age") setDraft(current ?? "");
    else if (key === "prefecture") setDraft((current as string) ?? "未設定");
    else setDraft((current as string) ?? "");
  };

  // 保存
  const saveField = async () => {
    if (!uid || !editingKey) return;

    let value: any = draft;

    // 入力値整形
    if (editingKey === "age") {
      const n = Number(draft);
      if (Number.isNaN(n) || n < 0 || n > 120) {
        alert("年齢は0〜120の数値で入力してください。");
        return;
      }
      value = n;
    }
    if (editingKey === "gender" && !GENDERS.includes(draft)) {
      value = "未選択";
    }

    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, "users", uid, "profile", "main");
      await updateDoc(ref, {
        [editingKey]: value,
        updatedAt: serverTimestamp(),
      });
      setProfile((p) => ({ ...p, [editingKey]: value }));
      setEditingKey(null);
    } catch (e: any) {
      setError(e.message ?? "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const rows: { key: FieldKey; rightLabel?: string }[] = useMemo(
    () => [
      { key: "nickname", rightLabel: "編集" },
      { key: "age", rightLabel: "編集" },
      { key: "gender", rightLabel: "編集" },
      { key: "industry", rightLabel: "編集" },
      { key: "job", rightLabel: "編集" },
      { key: "income", rightLabel: "編集" },
      { key: "role", rightLabel: "編集" },
      { key: "prefecture", rightLabel: profile.prefecture ? "編集" : "登録" },
    ],
    [profile.prefecture]
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
            aria-label="戻る"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">プロフィール設定</h1>
        </div>
      </header>

      {/* 状態表示 */}
      {loading && <div className="p-4 text-sm text-slate-500">読み込み中…</div>}
      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* 本体リスト */}
      {!loading && (
        <main>
          <ul className="mt-2 divide-y divide-slate-200">
            {rows.map(({ key, rightLabel }) => (
              <li key={key}>
                <button
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
                  onClick={() => startEdit(key)}
                >
                  <div>
                    <div className="text-[15px] font-medium text-slate-800">
                      {LABELS[key]}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {formatValue(key, profile[key])}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600">
                      {rightLabel ?? "編集"}
                    </span>
                    <ChevronRight className="text-slate-400" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {/* 編集モーダル */}
      <Modal
        open={!!editingKey}
        title={editingKey ? LABELS[editingKey] : ""}
        onClose={() => setEditingKey(null)}
        onSave={saveField}
        saving={saving}
      >
        {editingKey === "gender" && (
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setDraft(g)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  draft === g
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {editingKey === "prefecture" && (
          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        {editingKey === "age" && (
          <input
            type="number"
            min={0}
            max={120}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="例: 26"
          />
        )}

        {editingKey &&
          !["gender", "prefecture", "age"].includes(editingKey) && (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="入力してください"
            />
          )}
      </Modal>
    </div>
  );
};

export default ProfileSettings;
