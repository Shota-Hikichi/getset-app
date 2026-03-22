import React, { useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import emailjs from "@emailjs/browser";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          department: formData.department,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSent(true);
      setFormData({
        name: "",
        email: "",
        department: "",
        subject: "",
        message: "",
      });
      alert("お問い合わせが送信されました。ありがとうございます。");
    } catch (err) {
      console.error("送信エラー:", err);
      alert("送信に失敗しました。しばらくしてから再度お試しください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">お問い合わせ</h1>
        </div>
      </header>

      {/* 本文 */}
      <main className="px-4 pb-24">
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              お名前
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="入力してください"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* メール */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="入力してください"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* 所属・部署 */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              所属・部署
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="入力してください"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* 件名 */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              件名
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="入力してください"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {/* 本文 */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              本文
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="入力してください"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 font-medium text-white hover:bg-sky-600 disabled:opacity-60"
            >
              <Send size={18} />
              {sending ? "送信中…" : "送信"}
            </button>
          </div>

          {sent && (
            <p className="pt-3 text-center text-sm text-green-600">
              ✅ 送信が完了しました。
            </p>
          )}
        </form>
      </main>
    </div>
  );
};

export default ContactPage;
