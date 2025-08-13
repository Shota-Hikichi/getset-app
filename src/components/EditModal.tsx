// src/components/EditModal.tsx
import React, { useEffect, useRef } from "react";

type Option = { value: string; label: string };

type EditModalProps = {
  open: boolean;
  title: string;
  mode?: "text" | "number" | "select";
  value: string;
  placeholder?: string;
  confirmLabel?: string;
  options?: Option[];
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  helperText?: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const EditModal: React.FC<EditModalProps> = ({
  open,
  title,
  mode = "text",
  value,
  placeholder = "入力してください",
  confirmLabel = "保存",
  options = [],
  inputProps,
  helperText,
  onChange,
  onClose,
  onConfirm,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-[1001] w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <button
            aria-label="閉じる"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="mb-2">
          {mode === "select" ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
            >
              {options.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              inputMode={mode === "number" ? "numeric" : undefined}
              {...inputProps}
            />
          )}
        </div>
        {helperText && (
          <p className="mb-4 text-xs text-gray-500">{helperText}</p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-sky-500 px-4 py-2 font-medium text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
