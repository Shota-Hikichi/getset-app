// src/pages/ProfileSettings.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditModal from "../components/EditModal";
import { auth, db, googleProvider } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Profile = {
  nickname: string;
  age: string; // 数値入力だが文字列管理（UI都合）
  gender: string; // セレクト
  industry: string;
  job: string;
  income: string; // 数値（円）を文字列で保持（表示時にフォーマット）
  role: string;
  prefecture: string; // セレクト
};
type ProfileKey = keyof Profile;

const LABELS: Record<ProfileKey, string> = {
  nickname: "ニックネーム",
  age: "年齢",
  gender: "性別",
  industry: "業種",
  job: "職種",
  income: "年収",
  role: "役職",
  prefecture: "お住まいの都道府県",
};

const PREFS = [
  "",
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

const FIELD_CONF: Record<
  ProfileKey,
  {
    type: "text" | "number" | "select";
    placeholder?: string;
    options?: { value: string; label: string }[];
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    helperText?: string;
  }
> = {
  nickname: { type: "text", placeholder: "入力してください" },
  age: {
    type: "number",
    placeholder: "年齢（半角数字）",
    inputProps: { min: 0, max: 120, step: 1 },
    helperText: "0〜120の範囲で入力してください。",
  },
  gender: {
    type: "select",
    options: [
      { value: "男", label: "男" },
      { value: "女", label: "女" },
      { value: "その他", label: "その他" },
    ],
  },
  industry: { type: "text", placeholder: "例：IT / 製造 / 医療 など" },
  job: { type: "text", placeholder: "例：ソフトウェアエンジニア" },
  income: {
    type: "number",
    placeholder: "年収（数字のみ）",
    inputProps: { min: 0, step: 100000 },
    helperText: "数字のみで入力（例：7000000）。表示時は￥表記されます。",
  },
  role: { type: "text", placeholder: "例：PdM / マネージャー など" },
  prefecture: {
    type: "select",
    options: PREFS.map((p) => ({ value: p, label: p || "選択してください" })),
  },
};

const formatYen = (v: string) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });
};
const isUnset = (v: string) => !v || v === "未設定";

const DEFAULT_PROFILE: Profile = {
  nickname: "ベイシャーウッド",
  age: "26",
  gender: "男",
  industry: "IT",
  job: "ソフトウェアエンジニア",
  income: "7000000",
  role: "PdM",
  prefecture: "", // ← 未設定は空文字
};

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 初回ロード
  const [saving, setSaving] = useState(false); // 保存中
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  // モーダル状態
  const [editingKey, setEditingKey] = useState<ProfileKey | null>(null);
  const [draft, setDraft] = useState<string>("");

  // 1) 認証状態の監視 + 初回読込
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setLoading(false);
        return;
      }
      setUid(user.uid);

      // Firestoreからロード
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Partial<Profile>;
          setProfile({ ...DEFAULT_PROFILE, ...data });
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const isOpen = useMemo(() => editingKey !== null, [editingKey]);
  const title = useMemo(
    () => (editingKey ? LABELS[editingKey] : ""),
    [editingKey]
  );
  const conf = useMemo(
    () => (editingKey ? FIELD_CONF[editingKey] : undefined),
    [editingKey]
  );

  const openEdit = (key: ProfileKey) => {
    setEditingKey(key);
    setDraft(profile[key] ?? "");
  };
  const closeEdit = () => {
    setEditingKey(null);
    setDraft("");
  };

  // 簡易バリデーション
  const validate = (key: ProfileKey, value: string): string | null => {
    const c = FIELD_CONF[key];
    if (!c) return null;
    if (c.type === "number") {
      if (value.trim() === "") return "値を入力してください。";
      if (!/^\d+$/.test(value.trim()))
        return "半角数字のみで入力してください。";
      const n = Number(value);
      if (c.inputProps?.min != null && n < Number(c.inputProps.min))
        return `${c.inputProps.min}以上で入力してください。`;
      if (c.inputProps?.max != null && n > Number(c.inputProps.max))
        return `${c.inputProps.max}以下で入力してください。`;
    }
    if (
      c.type === "select" &&
      value.trim() === "" &&
      editingKey !== "prefecture"
    ) {
      return "いずれかを選択してください。";
    }
    return null;
  };

  // 2) 保存（Firestore merge）
  const confirmEdit = async () => {
    if (!editingKey) return;
    const err = validate(editingKey, draft);
    if (err) {
      alert(err);
      return;
    }
    const newValue = draft.trim();
    const next = { ...profile, [editingKey]: newValue };

    setProfile(next); // 楽観的更新
    closeEdit();

    if (!uid) return; // 未ログインならローカル更新だけ

    try {
      setSaving(true);
      const ref = doc(db, "users", uid);
      await setDoc(ref, { [editingKey]: newValue }, { merge: true }); // 変更フィールドだけ保存
    } catch (e) {
      alert("保存に失敗しました。ネットワークを確認してください。");
      // 失敗時は元に戻す
      setProfile(profile);
    } finally {
      setSaving(false);
    }
  };

  // 3) 必要なら簡易ログインボタン（Firebase Authを使わない場合は削除可）
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider); // ← これだけでOK
    } catch (e) {
      console.error(e);
      alert("ログインに失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-gray-500">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <div className="flex items-center border-b px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-xl"
          aria-label="戻る"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">プロフィール設定</h1>
        {saving && (
          <span className="ml-auto text-xs text-gray-500">保存中…</span>
        )}
      </div>

      {/* 未ログイン時の案内（任意） */}
      {!uid && (
        <div className="mx-4 mt-4 rounded-xl border bg-amber-50 p-3 text-sm text-amber-700">
          ログインしてプロフィールをクラウドに保存できます。
          <button
            onClick={signIn}
            className="ml-3 rounded-lg bg-sky-500 px-3 py-1 text-white"
          >
            Googleでログイン
          </button>
        </div>
      )}

      {/* リスト */}
      <div className="space-y-4 p-4">
        {(Object.keys(LABELS) as ProfileKey[]).map((key) => {
          const label = LABELS[key];
          let display = profile[key];
          if (key === "income") display = formatYen(profile[key]);
          const showRegister = isUnset(profile[key]);
          return (
            <div
              key={key}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-base">{showRegister ? "未設定" : display}</p>
              </div>
              <button
                onClick={() => openEdit(key)}
                className={`rounded-full px-3 py-1 text-sm ${
                  showRegister
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-sky-500 hover:underline"
                }`}
              >
                {showRegister ? "登録" : "編集"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 編集モーダル */}
      <EditModal
        open={isOpen}
        title={title}
        mode={conf?.type ?? "text"}
        value={draft}
        placeholder={conf?.placeholder}
        options={conf?.options}
        inputProps={conf?.type === "number" ? conf.inputProps : undefined}
        helperText={conf?.helperText}
        confirmLabel={
          editingKey === "prefecture" && isUnset(profile.prefecture)
            ? "登録"
            : "保存"
        }
        onChange={setDraft}
        onClose={closeEdit}
        onConfirm={confirmEdit}
      />
    </div>
  );
};

export default ProfileSettings;
