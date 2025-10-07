import React from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type Props = {
  label: string;
  onClick: () => void;
  className?: string;
};

const PrimaryCTA: React.FC<Props> = ({ label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-center rounded-full bg-white text-[#0a3e59]",
        "px-6 py-5 text-[17px] font-bold shadow-lg ring-1 ring-black/5",
        "hover:shadow-xl active:scale-[0.98] transition",
        className
      )}
    >
      {label}
      <ChevronDown className="ml-2" />
    </button>
  );
};

export default PrimaryCTA;
