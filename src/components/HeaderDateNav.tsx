import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

const HeaderDateNav: React.FC<Props> = ({
  date,
  onPrev,
  onNext,
  className,
}) => {
  return (
    <div className={clsx("flex items-center justify-between px-4", className)}>
      <button
        onClick={onPrev}
        className="p-2 text-white hover:bg-white/20 rounded-full transition"
      >
        <ChevronLeft />
      </button>
      <div className="text-white text-lg font-semibold tracking-wide">
        {format(date, "yyyy年 M月 d日 (EEE)", { locale: ja })}
      </div>
      <button
        onClick={onNext}
        className="p-2 text-white hover:bg-white/20 rounded-full transition"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default HeaderDateNav;
