import React from "react";
import { ChevronLeft } from "lucide-react";

const TermsOfService: React.FC = () => {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      <header className="sticky top-0 z-10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
            aria-label="戻る"
          >
            <ChevronLeft />
          </button>
          <h1 className="text-base font-semibold">利用規約</h1>
        </div>
      </header>

      <main className="px-4 pb-24">
        <section className="prose prose-sm max-w-none">
          <h2>第1条（総則）</h2>
          <p>ここに利用規約本文を記載します。…</p>
          <h2>第2条（会員）</h2>
          <p>…</p>
          <h2>第3条（禁止事項）</h2>
          <p>…</p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
